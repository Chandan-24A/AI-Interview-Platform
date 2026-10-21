import { useState, useEffect } from "react";
import Setup from "../components/Setup.jsx";
import Interview from "../components/Interview.jsx";
import Report from "../components/Report";

const InterviewPage = () => {
  const [step, setStep] = useState(() => {
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
