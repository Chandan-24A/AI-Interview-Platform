import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAi } from "../services/openRouter.service.js";
import userModel from "../models/user.model.js";
import interviewModel from "../models/interview.model.js";
import { parse } from "path";

function generateDifficulty(index,total){  // Generate question difficulty Dynamically

    const progress = (index + 1)/total;

    if(progress <= 0.2) return "Easy";
    if(progress <= 0.5) return "Medium"
    if(progress <= 0.8) return "Hard";
    
    return "Boss";
}

function getTimeLimit(diff){ // Generate per Question Time Limit Dynamically
    const timeLimits = {
        "Easy":60,
        "Medium":90,
        "Hard":120,
        "Boss":200
    }

    return timeLimits[diff];
}
/*
  Analyze thr resume  given by the user and extract the reuired informations using OpenRouter Model
*/
async function analyzeResume(req,res){
    try{
        if(!req.file){
            return res.status(400).json({ message: "Resume Required" });
        }

        const filePath = req.file.path;
        
        const fileBuffer = await fs.promises.readFile(filePath);

        const uint8Array = new Uint8Array(fileBuffer);

        const pdf = await pdfjsLib.getDocument({data:uint8Array}).promise;

        let resumeText = "";

        // Extract all text from the pages of the pdf

        for(let pagenum = 1;pagenum<=pdf.numPages;pagenum++){
            const page = await pdf.getPage(pagenum);
            const content = await page.getTextContent();

            const pageContent = content.items.map(item => item.str).join(" ");

            resumeText += pageContent + "\n";
        }

        resumeText = resumeText.replace(/\s+/g," ").trim(); 

        //Resume Parse prompt

        const messages = [
        {
            role: "system",
            content: `
            Extract structured data from resume.

            Return strictly JSON:

            {
                "role": "string",
                "experience": "string",
                "projects": ["project1", "project2"],
                "skills": ["skill1", "skill2"]
            }
            `
        },
        {
            role: "user",
            content: resumeText
        }
        ];

        const aiResponse = await askAi(messages);

        let cleanedResponse = aiResponse.trim();
        const jsonStart = cleanedResponse.indexOf("{");
        const jsonEnd = cleanedResponse.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        const parsedRes = JSON.parse(cleanedResponse);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the file after the resume is parsed successfully
        }

        res.json({
            role:parsedRes.role,
            experience:parsedRes.experience,
            projects:parsedRes.projects,
            skills:parsedRes.skills,
            resumeText
        });

    }catch(error){
        console.log(error);

        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path)
        }

        return res.status(500).json( {message:error.message} );
    }
}
/*
 Generate the interview questions according user's resume and mode of interview
*/
async function generateQuestions(req,res){

    try{

        const {role,experience,mode,resumeText,projects,skills} = req.body;

        const trimmedRole = role?.trim();
        const trimmedExperience = experience?.trim();
        const trimmedMode = mode?.trim();

        if(!trimmedRole || !trimmedExperience || !trimmedMode){
            return res.status(400).json({message:"Role, Experience and Mode are required"});
        }

        const user = await userModel.findById(req.userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const projectsText = Array.isArray(projects) && projects.length
            ? projects.join(", ")
            : (typeof projects === "string" && projects.trim() ? projects.trim() : "None");

        const skillsText = Array.isArray(skills) && skills.length
            ? skills.join(", ")
            : (typeof skills === "string" && skills.trim() ? skills.trim() : "None");

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
        Role:${trimmedRole},
        Experience:${trimmedExperience},
        InterviewMode:${trimmedMode},
        Projects:${projectsText},
        Skills:${skillsText},
        Resume:${safeResume}
        `;

        if(!userPrompt.trim()){
            return res.status(400).json({message:"Prompt Content is Empty"});
        }

        const messages = [
            {
                role: "system",
                content: `
                You are a real human interviewer conducting a professional interview.

                Speak in simple, natural English as if you are directly talking to the candidate.

                Generate between 10 and 15 interview questions.

                Strict Rules:

                Generate a minimum of 10 and a maximum of 15 questions.

                Each question must contain between 15 and 25 words.

                Each question must be a single complete sentence.

                Do NOT number them.

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

                Make questions based on the candidate’s role, experience, interview mode, projects, skills, and resume details.
                `
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiResponse = await askAi(messages);

        if(!aiResponse || !aiResponse.trim()){
            return res.status(400).json({message:"AI returned empty response"})
        }

        const questionArray = aiResponse.split("\n").map(q => q.trim()).filter(q => q.length>0);

        if(questionArray.length === 0){
            return res.status(500).json({message:"AI Failed to generate questions."})
        }

        const interview = await interviewModel.create({
            userId:user._id,
            role: trimmedRole,
            experience: trimmedExperience,
            mode: trimmedMode,
            resumeText:safeResume,
            questions: questionArray.map((q, index) => {
                const difficulty = generateDifficulty(index, questionArray.length);

                return {
                    question: q,
                    difficulty: difficulty,
                    timeLimit: getTimeLimit(difficulty)
                };
            }),
        })

        return res.json({
            interviewId:interview._id,
            userName:user.username,
            questions:interview.questions
        });

    }catch(error){
        console.error("Error generating questions:", error);
        return res.status(500).json({
            message: `Failed to create interview. Due to the error: ${error.message || error}`
        });
    }
}

/*
 For each Question saves the answer given by user in database and calculate the respective scores accordingly
*/

async function submitAnswer(req,res){
    try{
        const {interviewId,questionIndex,answer,timeTaken} = req.body;

        const interview = await interviewModel.findById(interviewId);

        const question = interview.questions[questionIndex];
        
        // if no anwer given by user
        if(!answer){
            question.score = 0;
            question.feedback = "You didn't submit the answer.";
            question.answer = "";

            await interview.save();

            return res.json({
                feedback:question.feedback
            })

        }

        //if Time Limit exceeded

        if(timeTaken > question.timeLimit){
            question.score = 0;
            question.feedback = "Time Limit Exceeded. Answer will not be evaluated.";
            question.answer = answer;

            await interview.save();

            return res.json({
                feedback:question.feedback
            })

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

            Return ONLY valid JSON in this format:

            {
                "confidence": number,
                "communication": number,
                "correctness": number,
                "finalScore": number,
                "feedback": "short human feedback"
            }
            `
        },
        
        {
            role: "user",
            content: `
            Question: ${question.question}
            Answer: ${answer}
            `
        }
        ];

        const aiResponse = await askAi(messages);

        let cleanedResponse = aiResponse.trim();
        const jsonStart = cleanedResponse.indexOf("{");
        const jsonEnd = cleanedResponse.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(cleanedResponse);

        question.answer = answer;
        question.confidence = parsed.confidence;
        question.communication = parsed.communication;
        question.correctness = parsed.correctness;
        question.score = parsed.finalScore ?? parsed.score ?? 0;
        question.feedback = parsed.feedback;

        await interview.save();

        return res.status(200).json({
            feedback:parsed.feedback
        })

    }catch(error){
        res.status(500).json({
            message: `Failed to submit answer.Due to the error: ${error}`
        })
    }
}

/*
 Concludes the interview process ,calulates the final score of the user/performance and provides a detailed analytics about it.
*/

async function finishInterview(req,res){
    try{

        const {interviewId} = req.body;

        const interview = await interviewModel.findById(interviewId);

        if(!interview){
            return res.status(400).json({
                message:"Failed to find Interview"
            })
        }

        const totalQuestions = interview.questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q)=>{
            totalScore+=q.score || 0;

            totalCommunication+=q.communication || 0;

            totalConfidence+=q.confidence || 0;

            totalCorrectness+=q.correctness || 0;
        });

        const finalScore = totalQuestions? totalScore/totalQuestions : 0;

        const avgConfidence = totalQuestions? totalConfidence/totalQuestions : 0;

        const avgCommunication = totalQuestions? totalCommunication/totalQuestions : 0;

        const avgCorrectness = totalQuestions? totalCorrectness/totalQuestions : 0;

        interview.finalScore = finalScore;

        interview.status = "Completed";

        await interview.save();

        return res.status(200).json({
            finalScore: Number((interview.finalScore || 0).toFixed(1)),
            confidence:Number(avgConfidence.toFixed(1)),
            communication:Number(avgCommunication.toFixed(1)),
            correctness:Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q)=> ({
                question:q.question,
                score:q.score || 0,
                feedback: q.feedback || "",
                confidence:q.confidence || 0,
                communication:q.communication || 0,
                correctness:q.correctness || 0,
            }))
        })
    }catch(error){
        res.status(500).json({
            message: `Failed to finish the interview.Due to the error: ${error}`
        })
    }
}

async function getInterviewHistory(req,res) {
    try{
        const interviews = await interviewModel
            .find({ userId: req.userId })
            .select("role experience mode finalScore status createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json(interviews); 


    }catch(error){
        res.status(500).json({
            message: `Failed to find current user's interview history: ${error}`
        })
    }
}

async function getInterviewReport(req,res) {
    try{
        const interview = await interviewModel.findById(req.params.id);

        if(!interview){
            return res.status(404).json({message: "Interview not found"})
        }

        const totalQuestions = interview.questions.length;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q)=>{

            totalCommunication+=q.communication || 0;

            totalConfidence+=q.confidence || 0;

            totalCorrectness+=q.correctness || 0;
        });

        const avgConfidence = totalQuestions? totalConfidence/totalQuestions : 0;

        const avgCommunication = totalQuestions? totalCommunication/totalQuestions : 0;

        const avgCorrectness = totalQuestions? totalCorrectness/totalQuestions : 0;

        return res.json({
            finalScore: Number((interview.finalScore || 0).toFixed(1)),
            confidence:Number(avgConfidence.toFixed(1)),
            communication:Number(avgCommunication.toFixed(1)),
            correctness:Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        });

    }catch(error){
        res.status(500).json({
            message: `Failed to find current user's interview Report: ${error}`
        })
    }
}

export  {analyzeResume,generateQuestions,submitAnswer,finishInterview,getInterviewHistory,getInterviewReport};