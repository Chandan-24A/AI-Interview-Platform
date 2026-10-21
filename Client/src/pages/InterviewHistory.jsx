import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { FaArrowLeft, FaPlay, FaArrowRight, FaSpinner } from "react-icons/fa";
import ErrorPage from "./ErrorPage.jsx";
import { HistorySkeleton } from "../components/SkeletonLoader.jsx";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);
  const [resumingId, setResumingId] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    setErrorInfo(null);
    try {
      const result = await axios.get(
        `${serverUrl}/api/interview/get-interview-history`,
        { withCredentials: true }
      );
      setInterviews(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      const status = err.response?.status;
      let type = "something-went-wrong";
      if (status === 401 || status === 403) type = "unauthorized";
      else if (
        status === 502 ||
        status === 503 ||
        status === 504 ||
        !err.response
      )
        type = "server-unavailable";

      setErrorInfo({
        type,
        message:
          err.response?.data?.message ||
          "Failed to load interview history. Please check your connection or try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (e, interviewId) => {
    if (e) e.stopPropagation();
    setResumingId(interviewId);
    setResumeError("");
    try {
      const result = await axios.get(
        `${serverUrl}/api/interview/resume-interview/${interviewId}`,
        { withCredentials: true }
      );
      if (result.data) {
        navigate("/interview", {
          state: {
            resumeData: result.data,
            startIndex: result.data.startIndex,
          },
        });
      }
    } catch (err) {
      console.error("Failed to resume interview:", err);
      const message =
        err.response?.data?.message ||
        "Failed to resume interview. Please try again.";
      setResumeError(message);
    } finally {
      setResumingId(null);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (errorInfo) {
    return (
      <ErrorPage
        type={errorInfo.type}
        error={{ message: errorInfo.message }}
        onRetry={fetchHistory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10">
      <div className="w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto">
        <div className="mb-10 w-full flex items-start gap-4 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="m-1 p-3 rounded-full bg-white shadow hover:shadow-md transition cursor-pointer"
            title="Back to Home"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h1 className="text-3xl font-bold flex-nowrap text-gray-800">
              Interview History
            </h1>
            <p className="text-gray-500 mt-2">
              Track your past interviews and performance reports
            </p>
          </div>
        </div>

        {resumeError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between animate-fadeIn">
            <span>{resumeError}</span>
            <button
              onClick={() => setResumeError("")}
              className="text-red-500 hover:text-red-700 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Fetching past interview records...</span>
            </div>
            <HistorySkeleton />
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-500 mb-4">
              No interviews found. Ready to practice?
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition cursor-pointer"
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {interviews.map((item) => {
              const isIncomplete =
                item.status === "Incomplete" || item.status === "Incompleted";

              return (
                <div
                  key={item._id}
                  onClick={() =>
                    isIncomplete
                      ? handleResume(null, item._id)
                      : navigate(`/report/${item._id}`)
                  }
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-emerald-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="max-w-xl">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {item.jobDescription || item.role}
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        {item.experience} • {item.mode}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      {!isIncomplete ? (
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-600">
                            {item.finalScore ?? 0}/10
                          </p>
                          <p className="text-xs text-gray-400">Overall Score</p>
                        </div>
                      ) : (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-amber-600">
                            In Progress
                          </p>
                          <p className="text-xs text-gray-400">Unfinished</p>
                        </div>
                      )}

                      <span
                        className={`px-4 py-1 rounded-full text-xs font-semibold ${
                          !isIncomplete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isIncomplete ? "Incomplete" : item.status}
                      </span>

                      {isIncomplete ? (
                        <button
                          onClick={(e) => handleResume(e, item._id)}
                          disabled={resumingId === item._id}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow hover:shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {resumingId === item._id ? (
                            <>
                              <FaSpinner className="animate-spin text-sm" />
                              <span>Resuming...</span>
                            </>
                          ) : (
                            <>
                              <FaPlay className="text-xs" />
                              <span>Resume</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/report/${item._id}`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 px-3.5 py-2.5 rounded-xl transition border border-gray-200 hover:border-emerald-200 cursor-pointer"
                        >
                          <span>Report</span>
                          <FaArrowRight className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;
