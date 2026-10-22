import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendRegistrationEmail, sendLoginEmail } from "../services/email.service.js";
import blackListModel from "../models/blacklist.model.js";

/*
  Registration Controller
  - Token based Authentication
  - bcrypt for password hash
  - nodemailer to send email on Successful Registration
*/

const isProd = process.env.NODE_ENV === "production";

async function registerController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
    }

    try {
        const isExist = await userModel.findOne({
            $or: [{ email }, { username }],
        });

        if (isExist) {
            return res.status(409).json({ message: "User already exists with this email or username" });
        }

        const hashedpass = await bcrypt.hash(password, 10);
        const user = await userModel.create({ email, username, password: hashedpass });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });

        sendRegistrationEmail(email, username).catch((err) =>
            console.error("Failed to send registration email:", err.message)
        );
    } catch (err) {
        console.error("Error in registration:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

/*
  Login Controller
  - Token based Authentication
  - bcrypt for password Verification
  - nodemailer to send email on Successful Login
*/
async function loginController(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User does not exist, login failed",
            });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({
                message: "Invalid Password",
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });

        sendLoginEmail(email, user.username).catch((err) =>
            console.error("Failed to send login email:", err.message)
        );
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });
    } catch (err) {
        console.error("getMe error:", err);
        res.status(500).json({
            message: "Server Unavailable",
        });
    }
}

async function logOutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ?  "none" : "lax",
    });

    if (!token) {
        return res.status(200).json({
            message: "Logged out successfully",
        });
    }

    try {
        const alreadyBlacklisted = await blackListModel.findOne({ token });
        if (!alreadyBlacklisted) {
            await blackListModel.create({ token });
        }

        return res.status(200).json({
            message: "User Logged out Successfully",
        });
    } catch (err) {
        // Even if blacklist fails (e.g., duplicate key), cookie is cleared
        return res.status(200).json({
            message: "User Logged out Successfully",
        });
    }
}

export { registerController, loginController, getMe, logOutController };
