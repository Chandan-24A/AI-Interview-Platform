import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { serverUrl } from "../App";
import Report from "../components/Report.jsx";
import ErrorPage from "./ErrorPage.jsx";
import { ReportSkeleton } from "../components/SkeletonLoader.jsx";

const InterviewReport = () => {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setLoading(true);
      setErrorInfo(null);

      try {
        const result = await axios.get(
          `${serverUrl}/api/interview/get-interview-report/${id}`,
          { withCredentials: true }
        );
        setReport(result.data);
      } catch (err) {
        console.error("fetchReport error:", err);
        const status = err.response?.status;
        let type = "something-went-wrong";
        if (status === 401 || status === 403) type = "unauthorized";
        else if (status === 404) type = "not-found";
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
            "Failed to load interview report. It may not exist or you may not have permission to view it.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return <ReportSkeleton />;
  }

  if (errorInfo) {
    return (
      <ErrorPage
        type={errorInfo.type}
        error={{ message: errorInfo.message }}
      />
    );
  }

  return <Report report={report} />;
};

export default InterviewReport;
