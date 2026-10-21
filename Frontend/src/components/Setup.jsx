import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaFileAlt,
  FaCheckCircle,
  FaBullseye,
} from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import AILoadingScreen from "./AILoadingScreen.jsx";
import ATSScoreModal from "./ATSScoreModal.jsx";

const Setup = ({ onStart }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisIsDone, setAnalysisIsDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ATS State
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [atsError, setAtsError] = useState("");
  const [lastAnalyzedJD, setLastAnalyzedJD] = useState("");

  const handleFetchAtsScore = async (overrideJD) => {
    const jdToUse = (overrideJD !== undefined ? overrideJD : jobDescription)?.trim();

    if (!resumeText) {
      setAtsError("Please upload and analyze your resume first.");
      return;
    }

    if (!jdToUse) {
      setAtsError(
        "Please provide a target job description or role to evaluate ATS fit."
      );
      return;
    }

    setAtsLoading(true);
    setAtsError("");

    try {
      const res = await axios.post(
        `${serverUrl}/api/interview/analyze-ats`,
        {
          resumeText,
          jobDescription: jdToUse,
          role: jdToUse,
          skills,
          experience,
          projects,
        },
        { withCredentials: true }
      );
      setAtsData(res.data);
      setLastAnalyzedJD(jdToUse);
    } catch (err) {
      console.error("ATS analysis error:", err);
      setAtsError(
        err.response?.data?.message ||
          "Failed to calculate ATS score. Please check your connection or try again."
      );
    } finally {
      setAtsLoading(false);
    }
  };

  const handleOpenATS = () => {
    setIsAtsModalOpen(true);
    const currentJD = (jobDescription || "").trim();
    if (!atsData || currentJD !== lastAnalyzedJD) {
      handleFetchAtsScore(currentJD);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);
    setErrorMessage("");

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await axios.post(
        `${serverUrl}/api/interview/resume`,
        formdata,
        { withCredentials: true }
      );

      const targetJD = result.data.role && !jobDescription ? result.data.role : jobDescription;
      if (result.data.role && !jobDescription) {
        setJobDescription(result.data.role);
      }
      setExperience(result.data.experience || "");
      setProjects(Array.isArray(result.data.projects) ? result.data.projects : []);
      setSkills(Array.isArray(result.data.skills) ? result.data.skills : []);
      setResumeText(result.data.resumeText || "");
      setAnalysisIsDone(true);

      // Pre-evaluate ATS score if JD / extracted role is available
      if (targetJD && result.data.resumeText) {
        axios
          .post(
            `${serverUrl}/api/interview/analyze-ats`,
            {
              resumeText: result.data.resumeText,
              jobDescription: targetJD,
              role: targetJD,
              skills: result.data.skills || [],
              experience: result.data.experience || "",
              projects: result.data.projects || [],
            },
            { withCredentials: true }
          )
          .then((atsRes) => {
            setAtsData(atsRes.data);
            setLastAnalyzedJD(targetJD);
          })
          .catch((atsErr) => {
            console.warn("Background ATS calculation deferred:", atsErr);
          });
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to analyze resume. You can still fill details manually."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/interview/generate-questions`,
        {
          jobDescription,
          role: jobDescription,
          experience,
          mode,
          resumeText,
          projects,
          skills,
        },
        { withCredentials: true }
      );

      onStart(result.data);
    } catch (error) {
      console.error("Generate questions error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to generate questions. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && (
          <AILoadingScreen
            isOverlay={true}
            title="Setting Up Your Smart AI Interview"
            subtitle="Synthesizing personalized interview questions and room environment"
            badge="AI Engine Generating"
            steps={[
              "Analyzing Job Description & Key Competencies...",
              "Aligning Experience Level & Technical Domain...",
              "Synthesizing Scenario-Based Interview Questions...",
              "Calibrating Question Time Limits & Adaptive Difficulty...",
              "Configuring Conversational AI Interviewer Avatar...",
              "Opening Your Smart Interview Room...",
            ]}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4 py-8"
      >
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="relative bg-linear-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Start Your AI Interview
            </h2>

            <p className="text-gray-600 mb-10">
              Experience AI-powered mock interviews customized to your target job
              description, sharpen technical clarity, and gain realistic practice.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: <FaFileAlt className="text-green-600 text-xl" />,
                  text: "Target Job Description & Experience",
                },
                {
                  icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                  text: "Smart Voice Interview",
                },
                {
                  icon: <FaChartLine className="text-green-600 text-xl" />,
                  text: "Performance Analytics",
                },
              ].map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  key={index}
                  className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm"
                >
                  {item.icon}
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="p-8 sm:p-12 bg-white flex flex-col justify-center"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Interview Setup
            </h2>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {errorMessage}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Job Description / Target Role
                </label>
                <div className="relative">
                  <FaFileAlt className="absolute top-3.5 left-4 text-gray-400" />
                  <textarea
                    rows={3}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-sm resize-none text-gray-800"
                    placeholder="Paste the job description, required tech stack, or target role (e.g., Senior Full Stack Developer proficient in React, Node.js, and System Design...)"
                    onChange={(e) => setJobDescription(e.target.value)}
                    value={jobDescription}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Experience Level
                </label>
                <div className="relative">
                  <FaBriefcase className="absolute top-3.5 left-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-sm text-gray-800"
                    placeholder="Experience (e.g., 2 Years, Entry Level, 5+ Years)"
                    onChange={(e) => setExperience(e.target.value)}
                    value={experience}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Interview Mode
                </label>
                <select
                  onChange={(e) => setMode(e.target.value)}
                  value={mode}
                  className="w-full py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition font-normal text-sm text-gray-700"
                >
                  <option value="Technical">Technical Interview</option>
                  <option value="HR">HR Interview</option>
                </select>
              </div>

              {!analysisIsDone && (
                <div
                  onClick={() =>
                    !analyzing &&
                    document.getElementById("resumeUpload").click()
                  }
                  className={`relative overflow-hidden border-2 border-dashed rounded-xl p-5 text-center transition ${
                    analyzing
                      ? "border-emerald-500 bg-emerald-50/50 cursor-wait"
                      : "border-gray-300 hover:border-green-500 hover:bg-green-50 cursor-pointer"
                  }`}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    id="resumeUpload"
                    className="hidden"
                    disabled={analyzing}
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />

                  {analyzing ? (
                    <div className="py-2 space-y-3 relative">
                      {/* Laser Scanner Line */}
                      <motion.div
                        animate={{ y: [-15, 60, -15] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_#10b981]"
                      />

                      <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>AI Neural Scanner Analyzing Resume...</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Extracting core skills, relevant projects & experience
                      </p>

                      <div className="w-48 mx-auto bg-emerald-200/60 rounded-full h-1 overflow-hidden">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-1/2 h-full bg-emerald-600 rounded-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <FaFileUpload className="text-3xl mx-auto text-green-600 mb-2" />
                      <p className="text-gray-600 font-medium text-xs sm:text-sm">
                        {resumeFile
                          ? resumeFile.name
                          : "Click to Upload Resume (PDF, optional)"}
                      </p>

                      {resumeFile && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResumeUpload();
                          }}
                          className="mt-3 bg-gray-900 text-white px-5 py-1.5 text-xs rounded-lg hover:bg-gray-800 transition cursor-pointer"
                        >
                          Analyze Resume with AI
                        </motion.button>
                      )}
                    </>
                  )}
                </div>
              )}

              {analysisIsDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                      <FaCheckCircle className="text-emerald-600" />
                      <span>Resume Profile Extracted</span>
                    </div>

                    {atsData?.atsScore !== undefined && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        ATS: {atsData.atsScore}%
                      </span>
                    )}
                  </div>

                  {projects.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Projects Detected:
                      </p>
                      <ul className="list-disc list-inside text-gray-600 text-xs space-y-0.5">
                        {projects.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Skills Detected:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-white text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ATS Score & Job Fit Breakdown Button */}
                  <div className="pt-2 border-t border-emerald-200/70">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleOpenATS}
                      className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <FaBullseye className="text-sm" />
                      <span>
                        {atsData
                          ? `View ATS Score & Role Fit (${atsData.atsScore}%)`
                          : "View ATS Score & Job Fit Breakdown"}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <motion.button
                onClick={handleStart}
                disabled={!jobDescription || !experience || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full disabled:bg-gray-400 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-base sm:text-lg font-semibold transition duration-300 shadow-md cursor-pointer mt-2"
              >
                {loading ? "Preparing Interview..." : "Start Interview"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ATS & Job Fit Modal */}
      <ATSScoreModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        atsData={atsData}
        loading={atsLoading}
        error={atsError}
        jobDescription={jobDescription}
        onJobDescriptionChange={(newJD) => setJobDescription(newJD)}
        onAnalyze={handleFetchAtsScore}
        onStartInterview={handleStart}
      />
    </>
  );
};

export default Setup;
