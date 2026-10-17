import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import analyzeResume from "../controllers/interview.controller.js";
/*
  Routers for Interview page to parse resume ,generate questions and show report to user
*/

const interviewRouter = express.Router();

interviewRouter.post("/resume",authMiddleware,upload.single("resume"),analyzeResume);

export default interviewRouter;