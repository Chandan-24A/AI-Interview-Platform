import { motion } from "motion/react";

// Reusable Shimmer Bar
const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-gray-200/80 rounded-lg ${className}`}
  >
    <motion.div
      className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/50 to-transparent"
      animate={{ translateX: ["−100%", "100%"] }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      }}
    />
  </div>
);

// Animated Skeleton for Interview History List
export const HistorySkeleton = () => {
  return (
    <div className="grid gap-6">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse"
        >
          <div className="space-y-3 flex-1">
            {/* Title / Role */}
            <div className="h-5 bg-gray-200 rounded-md w-3/4 max-w-md" />
            {/* Details */}
            <div className="h-4 bg-gray-100 rounded-md w-1/3" />
            {/* Date */}
            <div className="h-3 bg-gray-100 rounded-md w-24" />
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right space-y-1">
              <div className="h-7 w-16 bg-gray-200 rounded-md ml-auto" />
              <div className="h-3 w-20 bg-gray-100 rounded-md" />
            </div>
            <div className="h-7 w-24 bg-emerald-50 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Animated Skeleton for Interview Report Dashboard
export const ReportSkeleton = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8 animate-pulse">
      {/* Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-xl w-64" />
          <div className="h-4 bg-gray-100 rounded-md w-48" />
        </div>
        <div className="h-11 bg-gray-200 rounded-xl w-36" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Side */}
        <div className="space-y-6">
          {/* Circular Score Box */}
          <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full border-8 border-gray-100 border-t-emerald-200 animate-spin" />
            <div className="h-4 bg-gray-200 rounded-md w-32" />
            <div className="h-3 bg-gray-100 rounded-md w-44" />
          </div>

          {/* Skills Breakdown Box */}
          <div className="bg-white rounded-3xl shadow-lg p-8 space-y-5">
            <div className="h-5 bg-gray-200 rounded-md w-36 mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 rounded-md w-24" />
                  <div className="h-4 bg-gray-100 rounded-md w-8" />
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart Box */}
          <div className="bg-white rounded-3xl shadow-lg p-8 space-y-4">
            <div className="h-5 bg-gray-200 rounded-md w-44" />
            <div className="h-64 bg-gray-50 rounded-2xl border border-gray-100 flex items-end p-4 gap-4 justify-around">
              {[40, 70, 55, 85, 60, 90, 75].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-8 bg-emerald-100 rounded-t-lg"
                />
              ))}
            </div>
          </div>

          {/* Question Breakdown Box */}
          <div className="bg-white rounded-3xl shadow-lg p-8 space-y-4">
            <div className="h-5 bg-gray-200 rounded-md w-48" />
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3"
              >
                <div className="h-5 bg-gray-200 rounded-md w-5/6" />
                <div className="h-12 bg-white rounded-xl border border-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shimmer;
