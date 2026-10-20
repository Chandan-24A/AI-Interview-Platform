import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice.js'
import axios from 'axios'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import InterviewReport from './pages/InterviewReport.jsx'

export const serverUrl = "http://localhost:3000"

const App = () => {

  const dispatch = useDispatch();

  useEffect(()=>{
    const getUser = async ()=>{
      try{
        const result = await axios.get(serverUrl + "/api/auth/details",{withCredentials:true});

        console.log(result);

        dispatch(setUserData(result.data.user));

      }catch(error){
        console.log(error.message);
        dispatch(setUserData(null));
      }
    }
    getUser();
  },[dispatch]);
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/interview' element={<InterviewPage />}/>
        <Route path='/history' element={<InterviewHistory/>}/>
        <Route path='/report/:id' element={<InterviewReport/>}/>
      </Routes>
    </div>
  )
}

export default App