import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from './redux/userSlice.js';
import axios from 'axios';
import InterviewPage from './pages/InterviewPage.jsx';
import InterviewHistory from './pages/InterviewHistory.jsx';
import InterviewReport from './pages/InterviewReport.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

export const serverUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Route guard component to protect authenticated paths
const ProtectedRoute = ({ children }) => {
  const { userData, isAuthChecked } = useSelector((state) => state.user);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Setup Axios interceptors for global error handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url || '';
        const status = error.response?.status;

        // 1. Network failure / Server completely offline / Gateway issues (502, 503, 504)
        const isNetworkError =
          !error.response &&
          (error.code === 'ERR_NETWORK' ||
            error.code === 'ECONNABORTED' ||
            error.message?.includes('Network Error'));

        const isServerUnavailable =
          status === 502 || status === 503 || status === 504;

        if (isNetworkError || isServerUnavailable) {
          if (!window.location.pathname.includes('/server-unavailable')) {
            navigate('/server-unavailable', {
              state: {
                message:
                  error.response?.data?.message ||
                  'Unable to reach the backend server. Please verify your connection or ensure the server is running.',
              },
            });
          }
          return Promise.reject(error);
        }

        // 2. Forbidden (403)
        if (status === 403) {
          navigate('/unauthorized', {
            state: {
              message:
                error.response.data?.message ||
                'You do not have permission to perform this action or view this resource.',
            },
          });
          return Promise.reject(error);
        }

        // 3. Unauthorized session expired (401 on protected requests)
        // (Do NOT redirect for login/register credentials failure or initial silent details check)
        if (
          status === 401 &&
          !url.includes('/api/auth/login') &&
          !url.includes('/api/auth/register') &&
          !url.includes('/api/auth/details')
        ) {
          dispatch(setUserData(null));
          navigate('/unauthorized', {
            state: {
              message:
                error.response?.data?.message ||
                'Your session has expired or is invalid. Please sign in again.',
            },
          });
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, dispatch]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/auth/details`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data.user));
      } catch (error) {
        dispatch(setUserData(null));
      }
    };
    getUser();
  }, [dispatch]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <InterviewHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <InterviewReport />
            </ProtectedRoute>
          }
        />

        {/* Custom Dedicated Error Pages */}
        <Route
          path="/unauthorized"
          element={<ErrorPage type="unauthorized" />}
        />
        <Route
          path="/server-unavailable"
          element={<ErrorPage type="server-unavailable" />}
        />
        <Route
          path="/error"
          element={<ErrorPage type="something-went-wrong" />}
        />

        {/* 404 Not Found Catch-All */}
        <Route path="*" element={<ErrorPage type="not-found" />} />
      </Routes>
    </div>
  );
};

export default App;
