// Polyfill Promise.withResolvers for Node runtimes < 22 (e.g. Node 20 on Render / Docker)
if (typeof Promise.withResolvers !== "function") {
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

import fs, { promises as fsPromises } from "fs";
import mongoose from "mongoose";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import userModel from "../models/user.model.js";
import interviewModel from "../models/interview.model.js";

function generateDifficulty(index, total) {
    const progress = (index + 1) / total;
    if (progress <= 0.2) return "Easy";
    if (progress <= 0.5) return "Medium";
    if (progress <= 0.8) return "Hard";
    return "Boss";
}

function getTimeLimit(diff) {
    const timeLimits = {
        Easy: 60,
        Medium: 90,
        Hard: 120,
        Boss: 200,
    };
    return timeLimits[diff] || 60;
}

// Safely extract and parse JSON from AI string responses
function extractJSON(text) {
    if (!text || typeof text !== "string") return null;
    let cleaned = text.trim();

    // Remove markdown code fences if present
    cleaned = cleaned.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

/*
  Analyze the resume given by the user and extract the required information using OpenRouter Model
*/
async function analyzeResume(req, res) {
    const filePath = req.file?.path;

    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const fileBuffer = await fsPromises.readFile(filePath);
        const uint8Array = new Uint8Array(fileBuffer);
        const pdf = await pdfjsLib.getDocument({
            data: uint8Array,
            isEvalSupported: false,
            useSystemFonts: true,
        }).promise;

        let resumeText = "";
        for (let pagenum = 1; pagenum <= pdf.numPages; pagenum++) {
            const page = await pdf.getPage(pagenum);
            const content = await page.getTextContent();
            const pageContent = content.items.map((item) => item.str).join(" ");
            resumeText += pageContent + "\n";
        }

        resumeText = resumeText.replace(/\s+/g, " ").trim();

        if (!resumeText) {
            return res.status(400).json({ message: "Could not extract text from the provided PDF." });
        }

        const messages = [
            {
                role: "system",
                content: `
                Extract structured data from resume.
                Return strictly JSON without markdown:
                {
                    "role": "string",
                    "experience": "string",
                    "projects": ["project1", "project2"],
                    "skills": ["skill1", "skill2"]
                }
                `,
            },
            {
                role: "user",
                content: resumeText,
            },
        ];

        const aiResponse = await askAi(messages);
        const parsedRes = extractJSON(aiResponse) || {};

        return res.json({
            role: parsedRes.role || "",
            experience: parsedRes.experience || "",
            projects: Array.isArray(parsedRes.projects) ? parsedRes.projects : [],
            skills: Array.isArray(parsedRes.skills) ? parsedRes.skills : [],
            resumeText,
        });
    } catch (error) {
        console.error("Resume analysis error:", error);
        return res.status(500).json({ message: error.message || "Failed to analyze resume" });
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkErr) {
                console.error("Failed to delete temp file:", unlinkErr);
            }
        }
    }
}

/*
  Generate interview questions according to user's resume and mode of interview
*/
async function generateQuestions(req, res) {
    try {
        const { jobDescription, role, experience, mode, resumeText, projects, skills } = req.body;

        const targetJobDescription = jobDescription?.trim() || role?.trim();
        const trimmedExperience = experience?.trim();
        let trimmedMode = mode?.trim();

        if (!targetJobDescription || !trimmedExperience || !trimmedMode) {
            return res.status(400).json({ message: "Job Description, Experience and Mode are required" });
        }

        // Normalize mode to valid enum
        if (trimmedMode.toLowerCase() === "technical") {
            trimmedMode = "Technical";
        } else if (trimmedMode.toLowerCase() === "hr") {
            trimmedMode = "HR";
        } else {
            return res.status(400).json({ message: "Mode must be either 'Technical' or 'HR'" });
        }

        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const projectsText = Array.isArray(projects) && projects.length
            ? projects.join(", ")
            : typeof projects === "string" && projects.trim()
            ? projects.trim()
            : "None";

        const skillsText = Array.isArray(skills) && skills.length
            ? skills.join(", ")
            : typeof skills === "string" && skills.trim()
            ? skills.trim()
            : "None";

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
        JobDescription:${targetJobDescription},
        Experience:${trimmedExperience},
        InterviewMode:${trimmedMode},
        Projects:${projectsText},
        Skills:${skillsText},
        Resume:${safeResume}
        `;

        const messages = [
            {
                role: "system",
                content: `
                You are a real human interviewer conducting a professional interview.
                Speak in simple, natural English as if you are directly talking to the candidate.
                Generate between 10 and 15 interview questions tailored to the specified Job Description.

                Strict Rules:
                Generate a minimum of 10 and a maximum of 15 questions.
                Each question must contain between 15 and 25 words.
                Each question must be a single complete sentence.
                Do NOT number them.
                Do NOT add bullet points.
                Do NOT add explanations.
                Do NOT add extra text before or after.
                One question per line only.
                Keep language simple and conversational.
                Questions must feel practical and realistic.
                Avoid asking duplicate or repetitive questions.

                Difficulty progression:
                First 20% of questions → easy
                Next 30% of questions → easy to medium
                Next 30% of questions → medium to hard
                Final 20% of questions → hard

                Make questions based on the target job description, candidate experience, interview mode, projects, skills, and resume details.
                `,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ];

        const aiResponse = await askAi(messages);

        if (!aiResponse || !aiResponse.trim()) {
            return res.status(400).json({ message: "AI returned empty response" });
        }

        // Clean each question line: remove any accidental numbering ("1. ", "1) ", "- ", "* ")
        const questionArray = aiResponse
            .split("\n")
            .map((q) => q.replace(/^(?:\d+[\.\)]|\*|-)\s*/, "").trim())
            .filter((q) => q.length > 0);

        if (questionArray.length === 0) {
            return res.status(500).json({ message: "AI Failed to generate questions." });
        }

        const interview = await interviewModel.create({
            userId: user._id,
            jobDescription: targetJobDescription,
            role: targetJobDescription,
            experience: trimmedExperience,
            mode: trimmedMode,
            resumeText: safeResume,
            questions: questionArray.map((q, index) => {
                const difficulty = generateDifficulty(index, questionArray.length);
                return {
                    question: q,
                    difficulty: difficulty,
                    timeLimit: getTimeLimit(difficulty),
                };
            }),
        });

        return res.json({
            interviewId: interview._id,
            userName: user.username,
            questions: interview.questions,
        });
    } catch (error) {
        console.error("Error generating questions:", error);
        return res.status(500).json({
            message: `Failed to create interview: ${error.message || error}`,
        });
    }
}

/*
  For each Question, saves the answer given by user in database and calculates respective scores
*/
async function submitAnswer(req, res) {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;

        if (!interviewId || !mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ message: "Invalid interview ID" });
        }

        const interview = await interviewModel.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Authorization check (IDOR protection)
        if (interview.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this interview" });
        }

        const idx = Number(questionIndex);
        if (isNaN(idx) || idx < 0 || idx >= interview.questions.length) {
            return res.status(400).json({ message: "Invalid question index" });
        }

        const question = interview.questions[idx];

        // If no answer given by user
        if (!answer || !answer.trim()) {
            question.score = 0;
            question.feedback = "No answer was submitted for this question.";
            question.answer = "";
            await interview.save();

            return res.json({
                feedback: question.feedback,
            });
        }

        // If Time Limit exceeded
        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time Limit Exceeded. Answer will not be evaluated.";
            question.answer = answer.trim();
            await interview.save();

            return res.json({
                feedback: question.feedback,
            });
        }

        const messages = [
            {
                role: "system",
                content: `
                You are a professional human interviewer evaluating a candidate's answer in a real interview.
                Evaluate naturally and fairly, like a real person would.

                Score the answer in these areas (0 to 10):
                1. Confidence – Does the answer sound clear, confident, and well-presented?
                2. Communication – Is the language simple, clear, and easy to understand?
                3. Correctness – Is the answer accurate, relevant, and complete?

                Rules:
                - Be realistic and unbiased.
                - Do not give random high scores.
                - If the answer is weak, score low.
                - If the answer is strong and detailed, score high.
                - Consider clarity, structure, and relevance.

                Calculate:
                finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

                Feedback Rules:
                - Write natural human feedback.
                - 20 to 25 words only.
                - Sound like real interview feedback.
                - Can suggest improvement if needed.
                - Do NOT repeat the question.
                - Do NOT explain scoring.
                - Keep tone professional and honest.

                Return ONLY valid JSON without markdown:
                {
                    "confidence": number,
                    "communication": number,
                    "correctness": number,
                    "finalScore": number,
                    "feedback": "short human feedback"
                }
                `,
            },
            {
                role: "user",
                content: `
                Question: ${question.question}
                Answer: ${answer}
                `,
            },
        ];

        const aiResponse = await askAi(messages);
        const parsed = extractJSON(aiResponse);

        if (parsed) {
            question.answer = answer;
            question.confidence = Number(parsed.confidence) || 5;
            question.communication = Number(parsed.communication) || 5;
            question.correctness = Number(parsed.correctness) || 5;
            question.score = Number(parsed.finalScore ?? parsed.score ?? 5);
            question.feedback = parsed.feedback || "Answer evaluated.";
        } else {
            // Graceful fallback if AI JSON fails
            question.answer = answer;
            question.confidence = 5;
            question.communication = 5;
            question.correctness = 5;
            question.score = 5;
            question.feedback = "Answer submitted and reviewed.";
        }

        await interview.save();

        return res.status(200).json({
            feedback: question.feedback,
        });
    } catch (error) {
        console.error("submitAnswer error:", error);
        return res.status(500).json({
            message: `Failed to submit answer: ${error.message || error}`,
        });
    }
}

/*
  Concludes the interview process, calculates final score and provides detailed analytics
*/
async function finishInterview(req, res) {
    try {
        const { interviewId } = req.body;

        if (!interviewId || !mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ message: "Invalid interview ID" });
        }

        const interview = await interviewModel.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Authorization check (IDOR protection)
        if (interview.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to access this interview" });
        }

        const totalQuestions = interview.questions.length;
        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalScore += q.score || 0;
            totalCommunication += q.communication || 0;
            totalConfidence += q.confidence || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        interview.finalScore = Number(finalScore.toFixed(1));
        interview.status = "Completed";

        await interview.save();

        return res.status(200).json({
            finalScore: interview.finalScore,
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
            })),
        });
    } catch (error) {
        console.error("finishInterview error:", error);
        return res.status(500).json({
            message: `Failed to finish the interview: ${error.message || error}`,
        });
    }
}

async function getInterviewHistory(req, res) {
    try {
        const interviews = await interviewModel
            .find({ userId: req.userId })
            .select("jobDescription role experience mode finalScore status createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json(interviews);
    } catch (error) {
        console.error("getInterviewHistory error:", error);
        return res.status(500).json({
            message: `Failed to find interview history: ${error.message || error}`,
        });
    }
}

async function getInterviewReport(req, res) {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid interview ID" });
        }

        const interview = await interviewModel.findById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Authorization check (IDOR protection)
        if (interview.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to view this interview report" });
        }

        const totalQuestions = interview.questions.length;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalCommunication += q.communication || 0;
            totalConfidence += q.confidence || 0;
            totalCorrectness += q.correctness || 0;
        });

        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

        return res.json({
            finalScore: Number((interview.finalScore || 0).toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions,
        });
    } catch (error) {
        console.error("getInterviewReport error:", error);
        return res.status(500).json({
            message: `Failed to find interview report: ${error.message || error}`,
        });
    }
}

async function abortInterview(req, res) {
    try {
        const { interviewId } = req.body;

        if (!interviewId || !mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({ message: "Invalid interview ID" });
        }

        const interview = await interviewModel.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Ownership verification
        if (interview.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to abort this interview" });
        }

        interview.status = "Incomplete";
        await interview.save();

        return res.status(200).json({
            message: "Interview marked as incomplete",
            interviewId: interview._id,
            status: interview.status,
        });
    } catch (error) {
        console.error("abortInterview error:", error);
        return res.status(500).json({
            message: `Failed to abort interview: ${error.message || error}`,
        });
    }
}

async function resumeInterview(req, res) {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid interview ID" });
        }

        const interview = await interviewModel.findById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Ownership verification
        if (interview.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to access this interview" });
        }

        const user = await userModel.findById(req.userId);

        // Find the first question index that doesn't have an answer
        let startIndex = interview.questions.findIndex((q) => !q.answer || !q.answer.trim());
        if (startIndex === -1) {
            startIndex = Math.max(0, interview.questions.length - 1);
        }

        return res.status(200).json({
            interviewId: interview._id,
            jobDescription: interview.jobDescription || interview.role,
            role: interview.role || interview.jobDescription,
            experience: interview.experience,
            mode: interview.mode,
            userName: user?.username || "Candidate",
            questions: interview.questions,
            startIndex,
            status: interview.status,
        });
    } catch (error) {
        console.error("resumeInterview error:", error);
        return res.status(500).json({
            message: `Failed to resume interview: ${error.message || error}`,
        });
    }
}

/*
  Analyze ATS score, skills match, and missing requirements between candidate's resume and job description
*/
async function analyzeAtsScore(req, res) {
    try {
        const { resumeText, jobDescription, role, skills, experience, projects } = req.body;
        const targetJobDescription = (jobDescription || role || "").trim();

        if (!resumeText || !resumeText.trim()) {
            return res.status(400).json({ message: "Resume content is required for ATS analysis." });
        }

        if (!targetJobDescription) {
            return res.status(400).json({
                message: "Target job description or role is required to evaluate ATS match.",
            });
        }

        const messages = [
            {
                role: "system",
                content: `
                You are an expert ATS (Applicant Tracking System) scanner and senior technical hiring manager.
                Analyze the candidate's resume content against the target Job Description / Role.
                1. Calculate a realistic ATS compatibility score from 0 to 100 based on keyword overlap, required vs possessed technical skills, experience alignment, and role domain.
                2. Identify matched skills (skills from candidate's resume that directly match or satisfy the job description requirements).
                3. Identify missing/required skills (important skills, tools, or requirements from the job description that are NOT found in candidate's resume).
                4. Provide an honest, insightful 2-3 sentence overall fit summary explaining how well they fit this particular role.
                5. Provide 2-4 key recommendations on how they can bridge skill gaps or strengthen their resume and interview answers for this role.

                Return strictly JSON without markdown:
                {
                    "atsScore": 82,
                    "scoreLevel": "Strong Match",
                    "summary": "Your background shows strong alignment with...",
                    "matchedSkills": ["Skill 1", "Skill 2"],
                    "missingSkills": ["Skill 3", "Skill 4"],
                    "keyRecommendations": [
                        "Highlight experience with...",
                        "Add projects demonstrating..."
                    ]
                }
                `,
            },
            {
                role: "user",
                content: `
                TARGET JOB DESCRIPTION / ROLE:
                ${targetJobDescription}

                CANDIDATE RESUME TEXT:
                ${resumeText.slice(0, 10000)}

                ${skills && Array.isArray(skills) && skills.length ? `EXTRACTED SKILLS: ${skills.join(", ")}` : ""}
                ${experience ? `CANDIDATE EXPERIENCE: ${experience}` : ""}
                ${projects && Array.isArray(projects) && projects.length ? `PROJECTS: ${projects.join(", ")}` : ""}
                `,
            },
        ];

        const aiResponse = await askAi(messages);
        const parsed = extractJSON(aiResponse) || {};

        let rawScore = parseInt(parsed.atsScore, 10);
        if (isNaN(rawScore)) rawScore = 70;
        const atsScore = Math.max(0, Math.min(100, rawScore));

        let scoreLevel = parsed.scoreLevel;
        if (!scoreLevel) {
            if (atsScore >= 75) scoreLevel = "Strong Match";
            else if (atsScore >= 50) scoreLevel = "Moderate Match";
            else scoreLevel = "Needs Improvement";
        }

        const matchedSkills = Array.isArray(parsed.matchedSkills)
            ? parsed.matchedSkills.map((s) => String(s).trim()).filter(Boolean)
            : [];

        const missingSkills = Array.isArray(parsed.missingSkills)
            ? parsed.missingSkills.map((s) => String(s).trim()).filter(Boolean)
            : [];

        const keyRecommendations = Array.isArray(parsed.keyRecommendations)
            ? parsed.keyRecommendations.map((r) => String(r).trim()).filter(Boolean)
            : [];

        const summary =
            parsed.summary ||
            `Candidate profile has an estimated ${atsScore}% ATS compatibility with the target role.`;

        return res.status(200).json({
            atsScore,
            scoreLevel,
            summary,
            matchedSkills,
            missingSkills,
            keyRecommendations,
            jobDescription: targetJobDescription,
        });
    } catch (error) {
        console.error("ATS analysis error:", error);
        return res.status(500).json({
            message: `Failed to analyze ATS score: ${error.message || error}`,
        });
    }
}

export {
    analyzeResume,
    generateQuestions,
    submitAnswer,
    finishInterview,
    abortInterview,
    resumeInterview,
    analyzeAtsScore,
    getInterviewHistory,
    getInterviewReport,
};
