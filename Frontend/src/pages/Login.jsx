import { RiRobot2Fill, RiSparklingLine } from "react-icons/ri";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Logic for login goes here
    try{
      const formData = new FormData(e.currentTarget);

      const email = formData.get("email");
      const password = formData.get("password");

      const response = await axios.post(serverUrl + "/api/auth/login",{email,password},{withCredentials:true});

      dispatch(setUserData(response.data.user));

      console.log(response);
      
      navigate('/')

    }catch(error){
      console.log(error.message);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#f3f3f3] items-center justify-center px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.03 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl border border-gray-200 shadow-2xl"
      >
        <div className="flex items-center justify-center mb-6 gap-3">
          <div className="bg-black rounded-lg p-2 text-white">
            <RiRobot2Fill size={18} />
          </div>
          <h2 className="font-semibold text-xl">
            AI Interview Platform
          </h2>
        </div>
        <h1 className="font-semibold text-xl md:text-2xl text-center leading-snug mb-2">
          Welcome Back to{" "}
          <span className="px-3 py-1 rounded-full inline-flex items-center gap-2 bg-green-100 text-green-600 mt-2">
            <RiSparklingLine size={18} />
            AI Interview
          </span>
        </h1>

        <p className="text-center text-gray-500 text-sm md:text-base leading-relaxed mb-8">
          Sign in to continue your personalized AI interview experience.
        </p>   

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="Enter your email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              placeholder="Enter your password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>

          <motion.button 
            type="submit"
            whileHover={{ opacity: 0.9, scale: 1.03 }}
            whileTap={{ opacity: 1, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-3 py-3 bg-slate-800 text-xl text-white rounded-full shadow-md mt-4 hover:bg-slate-900 hover:shadow-lg"
          >
            Login
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;