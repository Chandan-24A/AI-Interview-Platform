import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaLock,
  FaServer,
  FaExclamationTriangle,
  FaCompass,
  FaArrowLeft,
  FaRedo,
  FaHome,
  FaSignInAlt,
} from "react-icons/fa";

const errorConfigs = {
  unauthorized: {
    code: "401 / 403",
    title: "Unauthorized Access",
    subtitle: "You don't have permission to access this page or resource.",
    description:
      "Your session may have expired, or your account lacks the necessary credentials to view this content. Please sign in with an authorized account.",
    icon: FaLock,
    iconBg: "bg-amber-100 text-amber-600",
    gradient: "from-amber-50/60 via-white to-orange-50/40",
    primaryAction: {
      label: "Sign In",
      action: "login",
      icon: FaSignInAlt,
      className: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
    },
  },
  "server-unavailable": {
    code: "503 / Offline",
    title: "Server Unavailable",
    subtitle: "We're currently unable to connect to the backend server.",
    description:
      "The server might be temporarily undergoing maintenance, restarting, or there may be a network interruption. Please check your connection and try again.",
    icon: FaServer,
    iconBg: "bg-red-100 text-red-600",
    gradient: "from-red-50/60 via-white to-rose-50/40",
    primaryAction: {
      label: "Retry Connection",
      action: "reload",
      icon: FaRedo,
      className: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200",
    },
  },
  "something-went-wrong": {
    code: "500 / Error",
    title: "Something Went Wrong",
    subtitle: "An unexpected error occurred while processing your request.",
    description:
      "Our system encountered an unhandled issue. Don't worry, your interview data is preserved. Try reloading the page or return to the dashboard.",
    icon: FaExclamationTriangle,
    iconBg: "bg-indigo-100 text-indigo-600",
    gradient: "from-indigo-50/60 via-white to-purple-50/40",
    primaryAction: {
      label: "Try Again",
      action: "reload",
      icon: FaRedo,
      className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
    },
  },
  "not-found": {
    code: "404",
    title: "Page Not Found",
    subtitle: "The page you're searching for does not exist or has moved.",
    description:
      "We couldn't find the page you requested. Check the URL for typos or navigate back to the home page.",
    icon: FaCompass,
    iconBg: "bg-emerald-100 text-emerald-600",
    gradient: "from-emerald-50/60 via-white to-teal-50/40",
    primaryAction: {
      label: "Go Home",
      action: "home",
      icon: FaHome,
      className: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200",
    },
  },
};

const ErrorPage = ({ type: propType, error, onRetry }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine error type from prop, state, or path
  let activeType = propType || location.state?.type;
  if (!activeType) {
    const path = location.pathname.toLowerCase();
    if (path.includes("unauthorized")) activeType = "unauthorized";
    else if (path.includes("server") || path.includes("offline"))
      activeType = "server-unavailable";
    else if (path.includes("error") || path.includes("500"))
      activeType = "something-went-wrong";
    else activeType = "not-found";
  }

  const config = errorConfigs[activeType] || errorConfigs["something-went-wrong"];
  const IconComponent = config.icon;
  const PrimaryActionIcon = config.primaryAction.icon;

  const handlePrimaryClick = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    if (config.primaryAction.action === "login") {
      navigate("/login");
    } else if (config.primaryAction.action === "reload") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={`min-h-screen bg-linear-to-br ${config.gradient} flex items-center justify-center p-4 sm:p-6`}
    >
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 text-center relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-linear-to-br from-emerald-100 to-teal-200 blur-2xl opacity-50 -z-10" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-linear-to-br from-amber-100 to-rose-200 blur-2xl opacity-40 -z-10" />

        {/* Code Badge */}
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-gray-100 text-gray-600 mb-6 shadow-xs">
          {config.code}
        </span>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className={`w-20 h-20 rounded-2xl ${config.iconBg} mx-auto flex items-center justify-center text-3xl shadow-md mb-6`}
        >
          <IconComponent />
        </motion.div>

        {/* Title & Message */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          {config.title}
        </h1>

        <p className="text-sm sm:text-base font-semibold text-gray-700 mb-3">
          {config.subtitle}
        </p>

        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-6">
          {location.state?.message || error?.message || config.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrimaryClick}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer ${config.primaryAction.className}`}
          >
            <PrimaryActionIcon size={15} />
            {config.primaryAction.label}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
          >
            <FaHome size={15} />
            Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
            title="Go Back"
          >
            <FaArrowLeft size={13} />
            Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
