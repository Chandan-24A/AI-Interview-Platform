import { RiRobot2Fill } from "react-icons/ri";
import { RiSparklingLine } from "react-icons/ri";
import { motion } from "motion/react"
import { useNavigate } from "react-router-dom";
const Auth = ({isModel = false}) => {
  const navigate = useNavigate()

  return (
    <div className={`
    w-full 
    ${ isModel ? "py-4" : "min-h-screen flex bg-[#f3f3f3] items-center justify-center  px-6 py-20"}`}>
        <motion.div 
        initial={{opacity:0, y:-40}}
        animate={{opacity:1 , y:0}}
        transition={{duration:1.03}}

        className={`
            w-full 
            ${isModel ? "max-w-md p-8 rounded-3xl border border-gray-400" : "max-w-md p-8 bg-white rounded-3xl border border-gray-200 shadow-2xl"}`} >
            <div className="flex items-center justify-center mb-6 gap-3">
                <div className="bg-black rounded-lg p-2 text-white">
                    <RiRobot2Fill size={18}/>
                </div>
                <h2 className="font-semibold text-xl">
                    AI Interview Platform
                </h2>
            </div>
            <h1 className="font-semibold text-xl md:text-2xl text-center leading-snug mb-4">
                Welcome to{" "}
                <span className="px-3 py-1 rounded-full inline-flex  items-center gap-2 bg-green-100 text-green-600">
                    <RiSparklingLine size={18}/>
                    AI Interview Preparation
                </span>
            </h1>

            <p className="text-center text-gray-500 text-sm md:text-base leading-relaxed mb-8">
                Sign in to unlock your personalized AI interview experience. Practice tailored interviews, get real-time feedback, and build the confidence you need to succeed.
            </p>   

            <motion.button 
            onClick={()=> navigate("/register")}
            whileHover={{opacity:0.9 , scale:1.03}}
            whileTap={{opacity:1,scale:0.97}}
            transition={{duration:0.2}}
            className="w-full flex items-center justify-center gap-3 py-3 bg-emerald-600 text-2xl text-white rounded-full shadow-md hover:bg-emerald-700 hover:shadow-lg    ">
                Register
            </motion.button>

            <motion.button 
            onClick={()=> navigate("/login")}
            whileHover={{opacity:0.9 , scale:1.03}}
            whileTap={{opacity:1,scale:0.97}}
            transition={{duration:0.2}}
            className="w-full flex items-center justify-center gap-3 py-3 bg-slate-800 text-2xl text-white rounded-full shadow-md mt-2 hover:bg-slate-900 hover:shadow-lg">
                Login
            </motion.button>
        </motion.div>
    </div>
  )
}

export default Auth