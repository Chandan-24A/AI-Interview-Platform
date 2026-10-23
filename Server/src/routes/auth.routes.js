import express from "express";
import { registerController, loginController, getMe, logOutController } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { verifyEmailService, sendEmail } from "../services/email.service.js";

/*
  Routers for register, login and logout, and retrieving user info 
*/

const router = express.Router();

// Diagnostic endpoint to test Nodemailer configuration in production
router.get("/test-email", async (req, res) => {
    const diagnostic = await verifyEmailService();
    if (diagnostic.status !== "ready") {
        return res.status(500).json({
            success: false,
            diagnostic,
            help: "Make sure EMAIL_USER is your Gmail and EMAIL_PASS is a 16-character Google App Password (without spaces) in Render Environment.",
        });
    }

    const targetEmail = req.query.to || diagnostic.user;
    const sendResult = await sendEmail(
        targetEmail,
        "Test Email from AI Interview Platform 🚀",
        "If you see this, your Nodemailer email service is working in production!",
        "<div style='font-family: Arial; padding: 20px;'><h2>AI Interview Platform</h2><p>Your Nodemailer email service is working in production! 🎉</p></div>"
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
