import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
const Report = ({report}) => {
  if(!report){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading Report...
        </p>
      </div>
    )
  }

  const {finalScore=0,confidence=0,communication=0,correctness=0,questionWiseScore = []} = report;

  const questionScoreData = questionWiseScore.map((score,index)=>({
    name:`Q${index + 1}`,
    score:score.score || 0
  }))

  const skills = [
    {label: "Confidence", value:confidence},
    {label: "Communication", value:communication},
    {label: "Correctness" , value: correctness}
  ];

  let performanceText = "";
  let shortTagLine = "";

  if(finalScore >= 8){
    performanceText = "Ready for the upcoming job oppertunities.";
    shortTagLine = "Excellent clarity and Structured responses.";
  }else if(finalScore >= 5){
    performanceText = "Needs minor improvement before interviews.";
    shortTagLine = "Good Foundation, refine articulation";
  }else{
    performanceText = "Significant improvement required.";
    shortTagLine = "Work on clarity and confidence.";
  }

  const navigate = useNavigate();

  const score = finalScore/10;

  const percentage = (score/10)*100;  

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
         <div className="md:mb-10 w-full flex items-start gap-4 flex-wrap">
            <button
            onClick={()=> navigate("/history")} 
            className="m-1 p-3 rounded-full bg-white shadow hover:shadow-md transition">
            <FaArrowLeft className="text-gray-600 "/>
            </button>
         
            <div>
              <h1 className="text-3xl font-bold flex-nowrap  text-gray-800">
                Interview Analytics Dashboard
              </h1>
              <p className="text-gray-500 mt-2">
                AI powered performance insights
              </p>
            </div>
          </div>

          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transiton-all duration-300 font-semibold text-sm sm:text-base text-nowrap">
            Download PDF
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6">
          <motion.div 
          initial={{opacity:0}}
          animate={{opacity:1}}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center">
            <div className="relative w-20 h-20 sm:w-25 sm:h-25 mx-auto">
              <CircularProgressbar 
              value={percentage} 
              text={`${score}`}
              styles={buildStyles({
              textSize: "18px",
              pathColor:"#10b981",
              textColor: "#ef4444",
              trailColor: "#e5e7eb",
              pathTransition: "stroke-dashoffset 0.5s ease 0s"
              })}
              />
            </div>

            <p className="text-gray-400 text-sm sm:text-base">
              Out of 10
            </p>
            <div className="mt-4">
              <p className="font-semibold text-gray-800 text-sm sm:text-base">
                {performanceText}
              </p>

              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {shortTagLine}
              </p>
            </div>
          </motion.div>

          <motion.div 
          initial={{opacity:0}}
          animate={{opacity:1}}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
              Skills Evaluation
            </h3> 

            <div className="space-y-5">
              {
                skills.map((s,i)=>(
                  <div key={i}>
                    <div className="flex justify-between mb-2 text-sm sm:text-base">
                      <span>
                        {s.label}
                      </span>

                      <span className="font-semibold text-gray-600">
                        {s.value}
                      </span>
                    </div>

                    <div className="bg-gray-200 h-2 sm:h-3 rounded-full">
                      <div className="bg-green-500 h-full rounded-full"
                      style={{width: `${s.value*10}%`}}
                      >
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}} 
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">
              Performance Trend
            </h3>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray= "3 3"/>
                  <XAxis dataKey="name"/>
                  <YAxis domain={[0, 10]}/>
                  <Tooltip/>
                  <Area 
                  type="monotone"
                  dataKey="score"
                  stroke="#22c55e"
                  fill="#bbf7d0"
                  strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>  
            </div>
          </motion.div>

          <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
              Question Breakdown
            </h3>

            <div className="space-y-6">
              {questionWiseScore.map((q,i) => (
                <div key={i} className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                       <p className="text-xs text-gray-400">
                          Question {i + 1}
                       </p>

                       <p className="font-semibold text-gray-800 text-sm sm:text-base leading-relaxed">
                          {q.question || "Question not available"}
                       </p>

                    </div>

                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit">
                      {q.score ?? 0}/10
                    </div>
                  </div>

                  <div className="bg-green-50 border-green-200 p-4 rounded-lg">
                    <p className="text-xs text-green-600 font-semibold mb-1">
                      AI Feedback
                    </p>

                    <p className="text-sm text-gray-700 leading-relaxed">
                      {q.feedback && q.feedback.trim() !== ""? q.feedback : "No feedback available for this question."}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Report





// import { motion } from "motion/react";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import { FaCheckCircle, FaRedo, FaHome, FaChartBar, FaComments, FaAward } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const Report = ({ report }) => {
//   const navigate = useNavigate();

//   const {
//     finalScore = 0,
//     confidence = 0,
//     communication = 0,
//     correctness = 0,
//     questionWiseScore = [],
//   } = report || {};

//   const scorePercentage = Math.min(100, Math.round((finalScore / 10) * 100));

//   const getScoreBadge = (score) => {
//     if (score >= 8) return { label: "Excellent", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
//     if (score >= 6) return { label: "Good", color: "text-teal-600 bg-teal-50 border-teal-200" };
//     if (score >= 4) return { label: "Average", color: "text-amber-600 bg-amber-50 border-amber-200" };
//     return { label: "Needs Improvement", color: "text-red-600 bg-red-50 border-red-200" };
//   };

//   const badge = getScoreBadge(finalScore);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-50 py-10 px-4 sm:px-6">
//       <div className="max-w-4xl mx-auto space-y-8">
//         {/* Header card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center relative overflow-hidden"
//         >
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border mb-4 shadow-xs border-emerald-200 text-emerald-700 bg-emerald-50">
//             <FaCheckCircle className="text-emerald-500" /> Interview Completed
//           </div>

//           <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
//             Interview Performance Report
//           </h1>
//           <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
//             Detailed evaluation of your answers, communication skills, confidence, and correctness.
//           </p>

//           <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-8">
//             <div className="w-32 h-32">
//               <CircularProgressbar
//                 value={scorePercentage}
//                 text={`${finalScore}/10`}
//                 styles={buildStyles({
//                   textSize: "20px",
//                   pathColor: finalScore >= 6 ? "#10b981" : "#f59e0b",
//                   textColor: "#1f2937",
//                   trailColor: "#e5e7eb",
//                 })}
//               />
//             </div>

//             <div className="text-left space-y-2">
//               <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg border ${badge.color}`}>
//                 {badge.label}
//               </span>
//               <p className="text-2xl font-bold text-gray-800">
//                 Overall Score: {finalScore} <span className="text-sm font-normal text-gray-400">/ 10</span>
//               </p>
//               <p className="text-xs text-gray-500 max-w-xs">
//                 Calculated from your answers across all interview questions.
//               </p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Breakdown Metrics */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center gap-4"
//           >
//             <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-xl">
//               <FaAward />
//             </div>
//             <div>
//               <p className="text-xs text-gray-400 uppercase font-semibold">Confidence</p>
//               <p className="text-2xl font-bold text-gray-800">{confidence} <span className="text-xs font-normal text-gray-400">/ 10</span></p>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.15 }}
//             className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center gap-4"
//           >
//             <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
//               <FaComments />
//             </div>
//             <div>
//               <p className="text-xs text-gray-400 uppercase font-semibold">Communication</p>
//               <p className="text-2xl font-bold text-gray-800">{communication} <span className="text-xs font-normal text-gray-400">/ 10</span></p>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center gap-4"
//           >
//             <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
//               <FaChartBar />
//             </div>
//             <div>
//               <p className="text-xs text-gray-400 uppercase font-semibold">Correctness</p>
//               <p className="text-2xl font-bold text-gray-800">{correctness} <span className="text-xs font-normal text-gray-400">/ 10</span></p>
//             </div>
//           </motion.div>
//         </div>

//         {/* Per-question breakdown */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.25 }}
//           className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6"
//         >
//           <h2 className="text-xl font-bold text-gray-800">Question-by-Question Feedback</h2>

//           {questionWiseScore.length === 0 ? (
//             <p className="text-gray-400 text-sm">No questions evaluated.</p>
//           ) : (
//             <div className="space-y-4">
//               {questionWiseScore.map((q, idx) => (
//                 <div
//                   key={idx}
//                   className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2"
//                 >
//                   <div className="flex items-start justify-between gap-4">
//                     <p className="font-semibold text-gray-800 text-sm sm:text-base">
//                       <span className="text-emerald-600 mr-2">Q{idx + 1}.</span>
//                       {q.question}
//                     </p>
//                     <span className="shrink-0 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">
//                       Score: {q.score}/10
//                     </span>
//                   </div>

//                   {q.feedback && (
//                     <div className="bg-white p-3 rounded-xl border border-gray-200/50 text-xs sm:text-sm text-gray-600">
//                       <strong className="text-gray-700">Feedback: </strong>
//                       {q.feedback}
//                     </div>
//                   )}

//                   <div className="flex gap-4 pt-1 text-xs text-gray-500">
//                     <span>Confidence: <strong>{q.confidence ?? 0}/10</strong></span>
//                     <span>Communication: <strong>{q.communication ?? 0}/10</strong></span>
//                     <span>Correctness: <strong>{q.correctness ?? 0}/10</strong></span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </motion.div>

//         {/* Navigation Action Buttons */}
//         <div className="flex justify-center gap-4 pb-12">
//           <button
//             onClick={() => window.location.reload()}
//             className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition"
//           >
//             <FaRedo size={14} /> Practice Again
//           </button>
//           <button
//             onClick={() => navigate("/")}
//             className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-full font-semibold shadow-md transition"
//           >
//             <FaHome size={14} /> Back to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Report;
