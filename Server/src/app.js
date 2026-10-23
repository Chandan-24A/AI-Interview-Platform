import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";

const app = express();

app.set("trust proxy",1); // for Express to know that it is behind a reverse proxt(Render)

app.use(express.json());
app.use(cookieParser());
const defaultAllowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
];

// Parse CLIENT_URL which can be comma-separated, and normalize URLs (ensure protocol)
const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`));

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, or server-to-server)
            if (!origin) return callback(null, true);

            const cleanOrigin = origin.replace(/\/$/, "");

            const isAllowed =
                allowedOrigins.some((allowed) => cleanOrigin === allowed.replace(/\/$/, "")) ||
                /\.vercel\.app$/.test(cleanOrigin);

            if (isAllowed) {
                return callback(null, true);
            }

            console.warn(`Blocked by CORS: ${origin}`);
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
);

app.get("/", (req, res) => res.status(200).json({ message: "AI Interview Platform API is running", status: "healthy" }));
app.get("/health", (req, res) => res.status(200).json({ status: "healthy" }));

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

export default app;
