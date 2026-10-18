import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {analyzeResume, finishInterview, generateQuestions, submitAnswer} from "../controllers/interview.controller.js";
/*
  Routers for Interview page to parse resume ,generate questions and show report to user
*/

const interviewRouter = express.Router();

interviewRouter.post("/resume",authMiddleware,upload.single("resume"),analyzeResume);
interviewRouter.post("/generate-questions",authMiddleware,generateQuestions);
interviewRouter.post("/submit-answer",authMiddleware,submitAnswer);
interviewRouter.post("/finish-interview",authMiddleware,finishInterview);

export default interviewRouter;