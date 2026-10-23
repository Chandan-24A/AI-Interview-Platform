import express from "express";
import { registerController, loginController, getMe, logOutController } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { verifyEmailService, sendEmail } from "../services/email.service.js";

/*
  Routers for register, login and logout, and retrieving user info 
*/

const router = express.Router();

// Diagnostic endpoint to test Nodemailer configuration (Local development)
router.get("/test-email", async (req, res) => {
    const diagnostic = await verifyEmailService();
    if (diagnostic.status !== "ready") {
        return res.status(200).json({
            success: false,
            diagnostic,
            note: "Email notifications via Nodemailer are enabled for local development only and disabled in production.",
        });
    }

    const targetEmail = req.query.to || diagnostic.user;
    if (!targetEmail) {
        return res.status(400).json({
            success: false,
            diagnostic,
            help: "Please provide a target email using query param: /api/auth/test-email?to=your_email@example.com",
        });
    }

    const sendResult = await sendEmail(
        targetEmail,
        "Test Email from AI Interview Platform 🚀",
        "If you see this, your local Nodemailer email service is working!",
        "<div style='font-family: Arial; padding: 20px;'><h2>AI Interview Platform</h2><p>Your local Nodemailer email service is working! 🎉</p></div>"
    );

    return res.status(sendResult.success ? 200 : 500).json({
        success: sendResult.success,
        diagnostic,
        sendResult,
        sentTo: targetEmail,
    });
});

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/details", authMiddleware, getMe);
router.post("/logout", logOutController);
router.get("/logout", logOutController); 

export default router;
