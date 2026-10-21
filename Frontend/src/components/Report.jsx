import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
    performanceText = "Ready for upcoming job opportunities.";
    shortTagLine = "Excellent clarity and structured responses.";
  }else if(finalScore >= 5){
    performanceText = "Needs minor improvement before interviews.";
    shortTagLine = "Good foundation, refine articulation.";
  }else{
    performanceText = "Significant improvement required.";
    shortTagLine = "Work on clarity and confidence.";
  }

  const navigate = useNavigate();

  const score = Number(finalScore) || 0;

  const percentage = Math.min(100,Math.max(0,(score/10)*100));  

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 20;
    const contentWidth = pageWidth - margin * 2; // 170mm on A4
    const footerY = pageHeight - 10;

    const green = [34, 197, 94];
    const darkGreen = [22, 101, 52];
    const lightGreen = [240, 253, 244];
    const lightGray = [249, 250, 251];
    const darkText = [31, 41, 55];
    const mutedText = [55, 65, 81];

    let currentY = 22;

    // Sanitize text (removes stray newlines/extra spaces that break PDF wrapping)
    const cleanText = (val, fallback = "N/A") =>
        String(val ?? fallback)
            .replace(/\r?\n|\r/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    // Helper: Always call AFTER setting the target font & fontSize
    const wrapText = (value, width) =>
        doc.splitTextToSize(cleanText(value), width);

    // 1. Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...green);

    const titleLines = wrapText("AI Interview Performance Report", contentWidth);
    doc.text(titleLines, pageWidth / 2, currentY, { align: "center" });

    currentY += titleLines.length * 8;

    // Underline
    doc.setDrawColor(...green);
    doc.setLineWidth(0.7);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 10;

    // 2. Final Score Banner
    const numericScore = Number(finalScore) || 0;

    doc.setFillColor(...lightGreen);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...darkGreen);

    const scoreText = `Final Score: ${numericScore}/10`;
    doc.text(scoreText, pageWidth / 2, currentY + 12.5, { align: "center" });

    currentY += 28;

    // 3. Skills Assessment Box
    const skills = [
        ["Confidence", confidence],
        ["Communication", communication],
        ["Correctness", correctness],
    ];

    const boxPadding = 8;
    const labelWidth = 38;
    const valueWidth = contentWidth - boxPadding * 2 - labelWidth;
    const lineHeight = 5;

    // Set font BEFORE measuring wrapped lines
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);

    const skillRows = skills.map(([label, value]) => ({
        label,
        lines: wrapText(value, valueWidth),
    }));

    const skillHeight =
        16 +
        skillRows.reduce(
            (height, row) =>
                height + Math.max(lineHeight, row.lines.length * lineHeight) + 2.5,
            0
        );

    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, currentY, contentWidth, skillHeight, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...mutedText);
    doc.text("Skills Assessment", margin + boxPadding, currentY + 9);

    let skillY = currentY + 16;

    skillRows.forEach(({ label, lines }) => {
        const rowHeight = Math.max(lineHeight, lines.length * lineHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...mutedText);
        doc.text(label, margin + boxPadding, skillY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...darkText);
        // Do not pass maxWidth here since lines are already split
        doc.text(lines, margin + boxPadding + labelWidth, skillY);

        skillY += rowHeight + 2.5;
    });

    currentY += skillHeight + 8;

    // 4. Personalized Feedback Box
    let advice = "";
    if (numericScore >= 8) {
        advice =
            "Excellent performance! Maintain your confidence and structured approach. Continue refining clarity and supporting your answers with strong real-world examples.";
    } else if (numericScore >= 5) {
        advice =
            "Good foundation demonstrated. Improve clarity and structure, and practice delivering concise, confident answers supported by relevant examples.";
    } else {
        advice =
            "Further improvement is needed. Focus on structured thinking, clarity, and confident delivery. Practice answering interview questions aloud regularly.";
    }

    // Set exact font size BEFORE calling wrapText so width calculations match
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const adviceInnerWidth = contentWidth - boxPadding * 2;
    const adviceLines = wrapText(advice, adviceInnerWidth);
    const adviceLineHeight = 5;
    const adviceHeight = 16 + adviceLines.length * adviceLineHeight + 4;

    if (currentY + adviceHeight + 10 > footerY - 8) {
        doc.addPage();
        currentY = 22;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, adviceHeight, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...green);
    doc.text("Personalized Feedback", margin + boxPadding, currentY + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...mutedText);
    // Render pre-wrapped array with consistent lineHeightFactor (no duplicate maxWidth)
    doc.text(adviceLines, margin + boxPadding, currentY + 16, {
        lineHeightFactor: 1.35,
    });

    currentY += adviceHeight + 10;

    // 5. Question-wise Performance Table
    const questionRows = (questionWiseScore || []).map((q, i) => [
        String(i + 1),
        cleanText(q.question, "N/A"),
        `${q.score ?? 0}/10`,
        cleanText(q.feedback, "No feedback available."),
    ]);

    autoTable(doc, {
        startY: currentY,
        tableWidth: contentWidth,
        margin: {
            left: margin,
            right: margin,
            top: 20,
            bottom: 18,
        },
        head: [["#", "Question", "Score", "Feedback"]],
        body: questionRows,
        theme: "grid",
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4, // Increased padding prevents right-edge character clipping
            valign: "top",
            overflow: "linebreak",
            textColor: mutedText,
            lineColor: [229, 231, 235],
            lineWidth: 0.2,
        },
        headStyles: {
            fillColor: green,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            valign: "middle",
            cellPadding: 3.5,
        },
        columnStyles: {
            0: {
                cellWidth: 12,
                halign: "center",
            },
            1: {
                cellWidth: 62,
                overflow: "linebreak",
                halign: "left",
            },
            2: {
                cellWidth: 18,
                halign: "center",
            },
            3: {
                // Uses 'auto' to safely fill remaining 78mm without clipping
                cellWidth: "auto",
                overflow: "linebreak",
                halign: "left",
            },
        },
        alternateRowStyles: {
            fillColor: lightGray,
        },
        // Prevents a single question row from splitting across two pages
        rowPageBreak: "avoid",
        showHead: "everyPage",
        pageBreak: "auto",
    });

    // 6. Footer and Page Numbers
    const totalPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);

        doc.text(
            "AI Interview Platform | Performance Report",
            margin,
            footerY
        );

        doc.text(
            `Page ${page} of ${totalPages}`,
            pageWidth - margin,
            footerY,
            { align: "right" }
        );
    }

    doc.save("AI_Interview_Report.pdf");
};

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

          <button
          onClick={downloadPDF} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base text-nowrap cursor-pointer">
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
