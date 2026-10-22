import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";

const app = express();

app.set("trust proxy",1); // for Express to know that it is behind a reverse proxt(Render)

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.get("/", (req, res) => res.status(200).json({ message: "AI Interview Platform API is running", status: "healthy" }));
app.get("/health", (req, res) => res.status(200).json({ status: "healthy" }));

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

export default app;
