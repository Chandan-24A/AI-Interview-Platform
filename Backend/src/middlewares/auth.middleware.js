import jwt from "jsonwebtoken";
import blackListModel from "../models/blacklist.model.js";

/*
  Auth Middleware: Verifies JWT token from cookies or Authorization header.
  Checks token against the blacklist and extracts req.userId.
*/
async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    try {
        const isBlacklisted = await blackListModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Session expired or logged out. Please log in again.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired. Please log in again.",
            });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token. Please log in again.",
            });
        }
        console.error("Auth middleware error:", err);
        return res.status(500).json({
            message: "Internal server error during authentication",
        });
    }
}

export default authMiddleware;
