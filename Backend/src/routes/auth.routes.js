import express from "express";
import { registerController, loginController, getMe, logOutController } from "../controllers/auth.controller.js";

/*
  Routers for register,login and logout also to get userinfo 
*/

const router = express.Router();

router.post("/register",registerController);

router.post("/login",loginController);

router.get("/details",getMe);

router.post("/logout",logOutController)

export default router;