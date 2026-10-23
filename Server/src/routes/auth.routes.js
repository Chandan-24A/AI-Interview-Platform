import express from "express";
import { registerController, loginController, getMe, logOutController } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { verifyEmailService, sendEmail } from "../services/email.service.js";

/*
  Routers for register, login and logout, and retrieving user info 
*/

const router = express.Router();

// Diagnostic endpoint to test email configuration in production
router.get("/test-email", async (req, res) => {
    const diagnostic = await verifyEmailService();
    if (diagnostic.status !== "ready") {
        return res.status(500).json({
            success: false,
            diagnostic,
            help: "Add RESEND_API_KEY to Render Environment, or set EMAIL_USER and EMAIL_PASS.",
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
        "If you see this, your email service is working in production!",
        "<div style='font-family: Arial; padding: 20px;'><h2>AI Interview Platform</h2><p>Your email service is working in production! 🎉</p></div>"
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
router.get("/logout", logOutController); // For backward compatibility with existing links

export default router;
