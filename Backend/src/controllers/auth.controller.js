import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {sendRegistrationEmail, sendLoginEmail } from "../services/email.service.js";


/*
 Registration Controller
  - Token based Authentication
  - bcrypt for password hash
  - nodemailer to send email on Successful Registration
*/

async function registerController(req,res){

    const {username,email,password} = req.body;

    try{
        const isExist = await userModel.findOne({
            $or:[
              {email},
              {username}
            ]
        })

        if(isExist){
            return res.status(409).json({message:"User already exists with this email or username"});
        }

        const hashedpass = await bcrypt.hash(password,10);

        const user = await userModel.create({email,username,password:hashedpass});

        const token = await jwt.sign(
            {userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"},
        )

        res.cookie("token",token,{httpOnly:true,secure: process.env.NODE_ENV === "production"});

        res.status(201).json({
            message:"user created successfully",
            user:{
                id:user._id,
                email:user.email,
                username:user.username,
            }
        })

        sendRegistrationEmail(email,username).catch(err => console.error('Failed to send registration email:', err));

    }catch(err){
        console.error("Error in authentication:", err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

/*
 Login Controller
  - Token based Authentication
  - bcrypt for password Verification
  - nodemailer to send email on Successful Login
*/

async function loginController(req,res){
    const {email,password} = req.body;

    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(404).json({
                message:"User doesnot exist,login failed"
            });
        }

        const userpassword = user.password;

        const isValid = await bcrypt.compare(password,userpassword);

        if(!isValid){
            return res.status(401).json({
                message:"Invalid Password",
            })
        }

        const token = await jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

        res.cookie("token",token,{httpOnly:true,secure: process.env.NODE_ENV === "production"});

        res.status(200).json({
            message:"User logged in sucessfully",
            user:{
                id:user._id,
                email:user.email,
                username:user.username,
            }
        });

        sendLoginEmail(email,user.username).catch(err => console.error('Failed to send registration email:', err));

    }catch(err){
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}



export {registerController,loginController};