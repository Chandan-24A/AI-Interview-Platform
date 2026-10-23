import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { Resend } from "resend";

dotenv.config();

function getResendKey() {
    return (process.env.RESEND_API_KEY || "").trim();
}

function getSenderAddress() {
    return process.env.RESEND_FROM || "AI Interview Platform <onboarding@resend.dev>";
}

function getSmtpCredentials() {
    const user = (process.env.EMAIL_USER || process.env.EMAIL || "").trim();
    const rawPass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "").trim();
    const pass = rawPass.replace(/\s+/g, "").replace(/^["']|["']$/g, "");
    return { user, pass };
}

function createSmtpTransporter() {
    const { user, pass } = getSmtpCredentials();
    if (!user || !pass) return null;

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        connectionTimeout: 10000,
    });
}

// Verification function with provider diagnostics
async function verifyEmailService() {
    const resendKey = getResendKey();
    if (resendKey) {
        return {
            status: "ready",
            provider: "resend",
            sender: getSenderAddress(),
            message: `Resend email service ready using API key (${resendKey.slice(0, 6)}...${resendKey.slice(-4)})`,
        };
    }

    const { user, pass } = getSmtpCredentials();
    if (user && pass) {
        try {
            const transporter = createSmtpTransporter();
            if (!transporter) {
                return { status: "disabled", provider: "smtp", message: "SMTP transporter could not be initialized." };
            }
            await transporter.verify();
            return {
                status: "ready",
                provider: "smtp",
                user,
                message: `SMTP transporter verified and connected for: ${user}`,
            };
        } catch (err) {
            return {
                status: "error",
                provider: "smtp",
                user,
                message: `SMTP verification failed: ${err.message}`,
            };
        }
    }

    return {
        status: "disabled",
        provider: "none",
        message: "Neither RESEND_API_KEY nor EMAIL_USER/EMAIL_PASS is configured in environment variables.",
    };
}

// Log startup verification result immediately
verifyEmailService().then((res) => {
    if (res.status === "ready") {
        console.log(`[Email Service] ${res.message}`);
    } else {
        console.warn(`[Email Service] ${res.message}`);
    }
});

// Primary email sending function
const sendEmail = async (to, subject, text, html) => {
    const resendKey = getResendKey();

    // 1. Resend (HTTPS Port 443 - Works reliably in all cloud environments including Render)
    if (resendKey) {
        try {
            const resend = new Resend(resendKey);
            const from = getSenderAddress();
            const recipients = Array.isArray(to) ? to : [to];

            const { data, error } = await resend.emails.send({
                from,
                to: recipients,
                subject,
                text,
                html,
            });

            if (error) {
                console.error(`[Email Service] Resend error sending to <${to}>:`, error);
                return { success: false, provider: "resend", error: error.message || error };
            }

            console.log(`[Email Service] Email sent successfully via Resend to <${to}> (ID: ${data?.id})`);
            return { success: true, provider: "resend", messageId: data?.id };
        } catch (error) {
            console.error(`[Email Service] Unexpected Resend error sending to <${to}>:`, error.message);
            return { success: false, provider: "resend", error: error.message };
        }
    }

    // 2. SMTP / Nodemailer fallback
    const { user, pass } = getSmtpCredentials();
    if (user && pass) {
        try {
            const transporter = createSmtpTransporter();
            if (!transporter) {
                return { success: false, provider: "smtp", reason: "transporter_failed" };
            }

            const info = await transporter.sendMail({
                from: `"AI Interview Platform" <${user}>`,
                to,
                subject,
                text,
                html,
            });

            console.log(`[Email Service] Email sent successfully via SMTP to <${to}> (ID: ${info.messageId})`);
            return { success: true, provider: "smtp", messageId: info.messageId };
        } catch (error) {
            console.error(`[Email Service] Failed to send email via SMTP to <${to}>:`, error.message);
            return { success: false, provider: "smtp", error: error.message };
        }
    }

    console.warn(`[Email Service] Cannot send email to <${to}>: No email provider configured (missing RESEND_API_KEY).`);
    return { success: false, reason: "credentials_missing" };
};

// Registration Email 
async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to AI Interview Platform 🎉";

    const text = `
Hello ${name},

Welcome to AI Interview Platform!

Your account has been successfully created. You can now start practicing interviews and improving your skills with our AI-powered interview platform.

Thank you for joining us.

Regards,
AI Interview Platform Team
    `;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f5f7fa; color: #333;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
                <h1 style="color: #2563eb; text-align: center; margin-bottom: 25px;">
                    Welcome to AI Interview Platform 🎉
                </h1>
                <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">
                    Welcome to <strong>AI Interview Platform</strong>! Your account has been successfully created.
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                    You can now start practicing interviews, improve your communication skills, and prepare yourself with our AI-powered interview experience.
                </p>
                <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;">
                    <p style="margin: 0; color: #1d4ed8;">
                        Your account is ready. Start your interview preparation! 🚀
                    </p>
                </div>
                <p style="font-size: 15px; line-height: 1.6;">
                    If you did not create this account, please contact our support team immediately.
                </p>
                <p style="margin-top: 30px;">
                    Regards,<br><strong>AI Interview Platform Team</strong>
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                <p style="text-align: center; color: #888; font-size: 12px;">
                    © 2026 AI Interview Platform. All rights reserved.
                </p>
            </div>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
}

// Login Email
async function sendLoginEmail(userEmail, name) {
    const subject = "Successful Login to AI Interview Platform 🔐";

    const text = `
Hello ${name},

You have successfully logged in to your AI Interview Platform account.

You can now continue practicing and preparing for your upcoming interviews.

If this login was not made by you, please secure your account immediately.

Regards,
AI Interview Platform Team
    `;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f5f7fa; color: #333;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
                <h1 style="color: #2563eb; text-align: center; margin-bottom: 25px;">
                    Successful Login 🔐
                </h1>
                <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">
                    You have successfully logged in to your <strong>AI Interview Platform</strong> account.
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                    You can now continue practicing interviews and improving your skills with our AI-powered platform.
                </p>
                <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;">
                    <p style="margin: 0; color: #1d4ed8;">
                        Ready for your next interview? Let's practice! 🚀
                    </p>
                </div>
                <p style="font-size: 15px; line-height: 1.6;">
                    If you did not log in to your account, please secure your account immediately.
                </p>
                <p style="margin-top: 30px;">
                    Regards,<br><strong>AI Interview Platform Team</strong>
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                <p style="text-align: center; color: #888; font-size: 12px;">
                    © 2026 AI Interview Platform. All rights reserved.
                </p>
            </div>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
}

export { sendRegistrationEmail, sendLoginEmail, verifyEmailService, sendEmail };
