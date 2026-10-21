import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaTimes,
  FaBullseye,
  FaCheckCircle,
  FaCheck,
  FaExclamationTriangle,
  FaLightbulb,
  FaRedo,
  FaBriefcase,
  FaArrowRight,
} from "react-icons/fa";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ATSScoreModal = ({
  isOpen,
  onClose,
  atsData,
  loading,
  error,
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  onStartInterview,
}) => {
  const [editingJD, setEditingJD] = useState(false);
  const [tempJD, setTempJD] = useState(jobDescription || "");

  useEffect(() => {
    setTempJD(jobDescription || "");
  }, [jobDescription]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const score = atsData?.atsScore ?? 0;
  const scoreColor =
    score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreBadgeBg =
    score >= 75
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : score >= 50
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-rose-100 text-rose-800 border-rose-300";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-linear-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white text-lg shadow-inner">
                <FaBullseye />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  ATS Score & Job Fit Analysis
                </h2>
                <p className="text-xs text-emerald-100">
                  AI neural evaluation of your resume against target requirements
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
              title="Close Modal (Esc)"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Target Job Description Strip */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700 flex-1 min-w-0">
              <FaBriefcase className="text-emerald-600 shrink-0" />
              <span className="font-semibold shrink-0">Target Role / JD:</span>
              {!editingJD ? (
                <span className="truncate text-gray-600 font-normal italic">
                  {jobDescription || "No job description specified"}
                </span>
              ) : (
                <input
                  type="text"
                  value={tempJD}
                  onChange={(e) => setTempJD(e.target.value)}
                  placeholder="Enter target role or paste job description..."
                  className="w-full px-2.5 py-1 text-xs border border-emerald-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  autoFocus
                />
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {editingJD ? (
                <>
                  <button
                    onClick={() => {
                      if (onJobDescriptionChange) {
                        onJobDescriptionChange(tempJD);
                      }
                      setEditingJD(false);
                      onAnalyze(tempJD);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-semibold transition cursor-pointer"
                  >
                    Save & Analyze
                  </button>
                  <button
                    onClick={() => {
                      setTempJD(jobDescription || "");
                      setEditingJD(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 px-2 py-1 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingJD(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 transition cursor-pointer"
                >
                  Change Role
                </button>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {loading ? (
              <div className="py-14 text-center space-y-5">
                {/* Laser scan animation */}
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse" />
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <FaBullseye className="text-emerald-600 text-2xl absolute" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-800">
                    AI ATS Scanner Evaluating Resume Fit...
                  </h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Comparing semantic keywords, domain competencies, experience
                    levels, and requirements against your resume.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full w-fit mx-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Matching Technical Competencies...</span>
                </div>
              </div>
            ) : error ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    ATS Analysis Could Not Complete
                  </h3>
                  <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => onAnalyze(jobDescription)}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  <FaRedo className="text-xs" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : atsData ? (
              <>
                {/* Score Hero Card */}
                <div className="bg-linear-to-br from-emerald-50/60 via-teal-50/40 to-white border border-emerald-100 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Circular Score Gauge */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0">
                      <CircularProgressbar
                        value={score}
                        text={`${score}%`}
                        styles={buildStyles({
                          textColor: scoreColor,
                          pathColor: scoreColor,
                          trailColor: "#e5e7eb",
                          textSize: "22px",
                          strokeLinecap: "round",
                        })}
                      />
                    </div>

                    {/* Score Details & Summary */}
                    <div className="flex-1 text-center sm:text-left space-y-3">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBadgeBg}`}
                        >
                          {atsData.scoreLevel || "Compatibility Score"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {score >= 75
                            ? "High interview shortlist probability"
                            : score >= 50
                            ? "Moderate alignment with target role"
                            : "Noticeable skill gaps for this role"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed font-normal">
                        {atsData.summary}
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <FaCheck className="text-emerald-500" />
                          <span>
                            {atsData.matchedSkills?.length || 0} Matched Skills
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                          <FaExclamationTriangle className="text-amber-500" />
                          <span>
                            {atsData.missingSkills?.length || 0} Missing / Needed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Dual Grid: Matched vs Required/Missing */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <FaCheckCircle className="text-emerald-600 text-base" />
                        <span>Matched Skills</span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {atsData.matchedSkills?.length || 0}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Skills found in your resume that directly align with this job description:
                    </p>

                    {atsData.matchedSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {atsData.matchedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                          >
                            <FaCheck className="text-emerald-600 text-[10px]" />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-2">
                        No direct keyword matches detected.
                      </p>
                    )}
                  </div>

                  {/* Skills Required / Missing */}
                  <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                        <FaExclamationTriangle className="text-amber-600 text-base" />
                        <span>Required / Missing Skills</span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {atsData.missingSkills?.length || 0}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Skills explicitly or implicitly needed by this role not highlighted in your resume:
                    </p>

                    {atsData.missingSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {atsData.missingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                          >
                            <span className="text-amber-600 font-bold text-xs">+</span>
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium py-2">
                        🎉 Great job! All primary skills from the JD are covered in your resume.
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Recommendations */}
                {atsData.keyRecommendations?.length > 0 && (
                  <div className="bg-linear-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/30 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <FaLightbulb className="text-amber-500 text-base" />
                      <span>How to Boost Your Fit for This Role:</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-gray-700 pl-1">
                      {atsData.keyRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Ready to evaluate your resume fit against this job description?
                </p>
                <button
                  onClick={() => onAnalyze(jobDescription)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Run ATS Match Analysis
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => onAnalyze(jobDescription)}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <FaRedo className={`text-xs ${loading ? "animate-spin" : ""}`} />
              <span>Re-calculate ATS Fit</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200/60 transition cursor-pointer"
              >
                Close
              </button>

              {onStartInterview && (
                <button
                  onClick={() => {
                    onClose();
                    onStartInterview();
                  }}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow hover:shadow-md cursor-pointer"
                >
                  <span>Ready to Interview</span>
                  <FaArrowRight className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ATSScoreModal;
