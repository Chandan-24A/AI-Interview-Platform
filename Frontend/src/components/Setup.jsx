import { motion } from "motion/react";
import { useState } from "react";
import {
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaFileAlt,
} from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App.jsx";

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

      if (result.data.role && !jobDescription) {
        setJobDescription(result.data.role);
      }
      setExperience(result.data.experience || "");
      setProjects(Array.isArray(result.data.projects) ? result.data.projects : []);
      setSkills(Array.isArray(result.data.skills) ? result.data.skills : []);
      setResumeText(result.data.resumeText || "");
      setAnalysisIsDone(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
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
            Experience AI-powered mock interviews customized to the exact job description,
            sharpen your technical and behavioral skills, and build the confidence to succeed.
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
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
              >
                <FaFileUpload className="text-3xl mx-auto text-green-600 mb-2" />

                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-gray-600 font-medium text-xs sm:text-sm">
                  {resumeFile ? resumeFile.name : "Click to Upload Resume (PDF, optional)"}
                </p>

                {resumeFile && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResumeUpload();
                    }}
                    disabled={analyzing}
                    className="mt-3 bg-gray-900 text-white px-5 py-1.5 text-xs rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {analyzing ? "Analyzing Resume..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {analysisIsDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-800">
                  Resume Analysis Result
                </h3>
                {projects.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Projects:</p>
                    <ul className="list-disc list-inside text-gray-600 text-xs space-y-0.5">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
  );
};

export default Setup;
