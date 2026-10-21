import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Setup from "../components/Setup.jsx";
import Interview from "../components/Interview.jsx";
import Report from "../components/Report";

const InterviewPage = () => {
  const location = useLocation();

  const [step, setStep] = useState(() => {
    if (location.state?.resumeData) return 2;
    try {
      const saved = sessionStorage.getItem("active_interview");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.interviewData) {
          return parsed.step || 2;
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
    return 1;
  });

  const [interviewData, setInterviewData] = useState(() => {
    if (location.state?.resumeData) return location.state.resumeData;
    try {
      const saved = sessionStorage.getItem("active_interview");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.interviewData || null;
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
    return null;
  });

  // Handle incoming resume data from navigation state
  useEffect(() => {
    if (location.state?.resumeData) {
      setInterviewData(location.state.resumeData);
      setStep(2);
    }
  }, [location.state?.resumeData]);

  useEffect(() => {
    if (step === 2 && interviewData) {
      sessionStorage.setItem(
        "active_interview",
        JSON.stringify({ step: 2, interviewData })
      );
    } else if (step === 3) {
      sessionStorage.removeItem("active_interview");
    }
  }, [step, interviewData]);

  const handleAbort = () => {
    sessionStorage.removeItem("active_interview");
    setInterviewData(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 && (
        <Setup
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && interviewData && (
        <Interview
          interviewData={interviewData}
          onAbort={handleAbort}
          onFinish={(report) => {
            sessionStorage.removeItem("active_interview");
            setInterviewData(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && interviewData && <Report report={interviewData} />}
    </div>
  );
};

export default InterviewPage;
