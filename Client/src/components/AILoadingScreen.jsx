import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RiRobot2Fill } from "react-icons/ri";
import { HiSparkles } from "react-icons/hi";

const defaultSteps = [
  "Preparing your personalized interview session...",
  "Analyzing job requirements & competencies...",
  "Synthesizing customized scenario questions...",
  "Calibrating conversational room & voice avatar...",
  "Almost ready, initializing interview room...",
];

const AILoadingScreen = ({
  title = "Preparing Your Interview",
  subtitle = "AI is actively synthesizing your customized session",
  steps = defaultSteps,
  isOverlay = false,
  badge = "AI Engine Active",
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Smoothly cycle through the animated status phrases indefinitely
  useEffect(() => {
    if (!steps || steps.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [steps]);

  const content = (
    <div className="w-full max-w-md mx-auto text-center px-6 py-8 relative">
      {/* Ambient Breathing Glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-linear-to-tr from-emerald-400/30 to-teal-400/25 rounded-full blur-3xl pointer-events-none"
      />

      {/* Central Radar / Scanner Graphic */}
      <div className="relative w-32 h-32 mx-auto mb-5 flex items-center justify-center">
        {/* Outer Infinite Radar Pulse */}
        <motion.div
          animate={{
            scale: [0.85, 1.4],
            opacity: [0.7, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full border-2 border-emerald-400"
        />

        {/* Second Delayed Radar Ring */}
        <motion.div
          animate={{
            scale: [0.85, 1.4],
            opacity: [0.7, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: 1.1,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full border border-teal-300"
        />

        {/* Rotating Circular Scanner Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-1 rounded-full border-2 border-transparent border-t-emerald-500 border-r-teal-400"
        />

        {/* Inner Glowing Center Card */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl shadow-emerald-950/20"
        >
          <RiRobot2Fill size={32} className="text-emerald-400" />

          {/* Active Ping Dot */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
              <HiSparkles size={9} className="text-white" />
            </span>
          </span>
        </motion.div>
      </div>

      {/* Dynamic Soundwave Equalizer */}
      <div className="flex items-center justify-center gap-1.5 h-6 mb-4">
        {[0.3, 0.9, 1.4, 0.7, 1.2, 0.5, 1.0, 0.4].map((heightScale, i) => (
          <motion.span
            key={i}
            animate={{
              scaleY: [0.25, heightScale, 0.25],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            className="w-1 bg-linear-to-t from-emerald-600 via-emerald-400 to-teal-300 rounded-full h-5"
          />
        ))}
      </div>

      {/* Live Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-2 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        {badge}
      </div>

      {/* Title & Subtitle */}
      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-5">{subtitle}</p>

      {/* Animated Flowing Status Text (No artificial percentage numbers) */}
      <div className="h-11 mb-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50/90 px-4 py-2 rounded-xl border border-emerald-200/80 shadow-xs"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-2.5 h-2.5 border-2 border-emerald-600 border-t-transparent rounded-full shrink-0"
            />
            <span>{steps[currentStepIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Continuous Infinite Laser Scanner (Sweeps back and forth continuously) */}
      <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden relative shadow-inner">
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-1/2 h-full bg-linear-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_#10b981]"
        />
      </div>

      <p className="text-[11px] text-gray-400 mt-3 font-medium tracking-wide">
        Connecting with OpenRouter intelligence engine...
      </p>
    </div>
  );

  if (isOverlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-lg"
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      {content}
    </div>
  );
};

export default AILoadingScreen;
