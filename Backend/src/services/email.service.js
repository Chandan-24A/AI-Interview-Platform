import dotenv from "dotenv"
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"AI Interview Platform " <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
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
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background-color: #f5f7fa;
            color: #333;
        ">
            <div style="
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            ">
                <h1 style="
                    color: #2563eb;
                    text-align: center;
                    margin-bottom: 25px;
                ">
                    Welcome to AI Interview Platform 🎉
                </h1>

                <p style="font-size: 16px;">
                    Hello <strong>${name}</strong>,
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                    Welcome to <strong>AI Interview Platform</strong>!
                    Your account has been successfully created.
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                    You can now start practicing interviews, improve your
                    communication skills, and prepare yourself with our
                    AI-powered interview experience.
                </p>

                <div style="
                    background-color: #eff6ff;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 25px 0;
                    text-align: center;
                ">
                    <p style="margin: 0; color: #1d4ed8;">
                        Your account is ready. Start your interview preparation! 🚀
                    </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6;">
                    If you did not create this account, please contact our
                    support team immediately.
                </p>

                <p style="margin-top: 30px;">
                    Regards,<br>
                    <strong>AI Interview Platform Team</strong>
                </p>

                <hr style="
                    border: none;
                    border-top: 1px solid #eee;
                    margin: 25px 0;
                ">

                <p style="
                    text-align: center;
                    color: #888;
                    font-size: 12px;
                ">
                    © 2026 AI Interview Platform. All rights reserved.
                </p>
            </div>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

//login Email

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
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background-color: #f5f7fa;
            color: #333;
        ">
            <div style="
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            ">
                <h1 style="
                    color: #2563eb;
                    text-align: center;
                    margin-bottom: 25px;
                ">
                    Successful Login 🔐
                </h1>

                <p style="font-size: 16px;">
                    Hello <strong>${name}</strong>,
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                    You have successfully logged in to your
                    <strong>AI Interview Platform</strong> account.
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                    You can now continue practicing interviews and improving
                    your skills with our AI-powered platform.
                </p>

                <div style="
                    background-color: #eff6ff;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 25px 0;
                    text-align: center;
                ">
                    <p style="margin: 0; color: #1d4ed8;">
                        Ready for your next interview? Let's practice! 🚀
                    </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6;">
                    If you did not log in to your account, please secure your
                    account immediately.
                </p>

                <p style="margin-top: 30px;">
                    Regards,<br>
                    <strong>AI Interview Platform Team</strong>
                </p>

                <hr style="
                    border: none;
                    border-top: 1px solid #eee;
                    margin: 25px 0;
                ">

                <p style="
                    text-align: center;
                    color: #888;
                    font-size: 12px;
                ">
                    © 2026 AI Interview Platform. All rights reserved.
                </p>
            </div>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

export {sendRegistrationEmail,sendLoginEmail};