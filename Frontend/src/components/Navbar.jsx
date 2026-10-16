import { useDispatch, useSelector } from "react-redux"
import { motion } from "motion/react"
import { RiRobot2Fill } from "react-icons/ri";
import { HiOutlineLogout } from "react-icons/hi"
import { FaUserAstronaut } from "react-icons/fa"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { setUserData } from "../redux/userSlice.js";
import AuthModel from "./AuthModel.jsx";

const Navbar = () => {
  const {userData} = useSelector((state)=>state.user)
  const [userPopup,setUserPopup] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showAuth,setShowAuth] = useState(false)

  const handleLogOut = async () =>{
    try{
        await axios.get(serverUrl + '/api/auth/logout' , {withCredentials:true})
        dispatch(setUserData(null))
        setUserPopup(false)
        navigate("/")

    }catch(error){
        console.log(error)
    }
  }

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
        <motion.div
        initial={{opacity:0 , y:-40}}
        animate={{opacity:1 , y:0}}
        transition={{duration:0.3}}
         className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-gray-200 px-8 py-3 flex justify-between items-center relative">
            <div className="flex items-center gap-3 cursor-pointer">
                <div className="bg-black text-white p-2 rounded-lg">
                    <RiRobot2Fill size={18}/>
                </div>
                <h1 className="font-semibold hidden md:block text-lg">AI Interview Platform</h1>
            </div>

            <div className="flex items-center gap-6 relative">
                <div className="relative">
                    <button onClick={()=>{
                        if(!userData){
                            setShowAuth(true)
                            return;
                        }
                        setUserPopup(!userPopup)
                        }} className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                        {userData ? userData?.username.slice(0,1).toUpperCase():<FaUserAstronaut size={16}/>}
                    </button>

                    { userPopup && (
                        <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
                            <p className="text-md text-blue-500 font-medium mb-1">{userData?.username}</p>

                            <button onClick={()=>navigate("/history")} className="w-full text-left text-sm py-2 hover:text-black text-gray-600">
                                InterView History
                            </button>

                            <button onClick={handleLogOut} className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500">
                                <HiOutlineLogout size={16}/>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>

        {showAuth && <AuthModel onClose={()=>{setShowAuth(false)}}/>}
    </div>
  )
}

export default Navbar