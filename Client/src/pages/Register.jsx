import { RiRobot2Fill, RiSparklingLine } from "react-icons/ri";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const username = formData.get("username");
      const email = formData.get("email");
      const password = formData.get("password");

      const response = await axios.post(
        `${serverUrl}/api/auth/register`,
        { username, email, password },
        { withCredentials: true }
      );

      dispatch(setUserData(response.data.user));
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to create account. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
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
          <h2 className="font-semibold text-xl">AI Interview Platform</h2>
        </div>
        <h1 className="font-semibold text-xl md:text-2xl text-center leading-snug mb-2">
          Create an Account{" "}
          <span className="px-3 py-1 rounded-full inline-flex items-center gap-2 bg-green-100 text-green-600 mt-2">
            <RiSparklingLine size={18} />
            Start Preparing
          </span>
        </h1>

        <p className="text-center text-gray-500 text-sm md:text-base leading-relaxed mb-6">
          Join us to unlock personalized AI interviews and real-time feedback.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name / Username
            </label>
            <input
              name="username"
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ opacity: 0.9, scale: 1.03 }}
            whileTap={{ opacity: 1, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-3 py-3 bg-slate-800 text-xl text-white rounded-full shadow-md mt-4 hover:bg-slate-900 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:underline"
          >
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
