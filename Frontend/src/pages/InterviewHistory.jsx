import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { FaArrowLeft } from "react-icons/fa";
import ErrorPage from "./ErrorPage.jsx";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    setErrorInfo(null);
    try {
      const result = await axios.get(
        `${serverUrl}/api/interview/get-interview-history`,
        { withCredentials: true }
      );
      setInterviews(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      const status = err.response?.status;
      let type = "something-went-wrong";
      if (status === 401 || status === 403) type = "unauthorized";
      else if (
        status === 502 ||
        status === 503 ||
        status === 504 ||
        !err.response
      )
        type = "server-unavailable";

      setErrorInfo({
        type,
        message:
          err.response?.data?.message ||
          "Failed to load interview history. Please check your connection or try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10 flex items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow text-center flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500">Loading your interview history...</p>
        </div>
      </div>
    );
  }

  if (errorInfo) {
    return (
      <ErrorPage
        type={errorInfo.type}
        error={{ message: errorInfo.message }}
        onRetry={fetchHistory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10">
      <div className="w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto">
        <div className="mb-10 w-full flex items-start gap-4 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="m-1 p-3 rounded-full bg-white shadow hover:shadow-md transition cursor-pointer"
            title="Back to Home"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h1 className="text-3xl font-bold flex-nowrap text-gray-800">
              Interview History
            </h1>
            <p className="text-gray-500 mt-2">
              Track your past interviews and performance reports
            </p>
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-500 mb-4">
              No interviews found. Ready to practice?
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition cursor-pointer"
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {interviews.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/report/${item._id}`)}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="max-w-xl">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {item.jobDescription || item.role}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {item.experience} • {item.mode}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        {item.finalScore ?? 0}/10
                      </p>
                      <p className="text-xs text-gray-400">Overall Score</p>
                    </div>

                    <span
                      className={`px-4 py-1 rounded-full text-xs font-medium ${
                        item.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;
