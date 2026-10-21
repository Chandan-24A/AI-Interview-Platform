import express from "express";
import { registerController, loginController, getMe, logOutController } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

/*
  Routers for register, login and logout, and retrieving user info 
*/

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/details", authMiddleware, getMe);
router.post("/logout", logOutController);
router.get("/logout", logOutController); // For backward compatibility with existing links

export default router;
