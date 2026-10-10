import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import blackListModel from "../models/blacklist.model.js";

/*
 -auth Middleware 
 -check user is authenticated or not
*/

async function authMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ];

    if(!token){
        return res.status(400).json({
            message:"Invalid Token,Unautherized access"
        })
    }

    const isValid = await blackListModel.findOne({token})

    if(isValid){
        return res.status(409).json({
            message:"Unautherized Access"
        })
    }

    try{
        const decoded = await jwt.verify(token,process.env.JWT_SECRET)

        req.userId = decoded.userId

        next()

    }catch(err){
        console.log(err);
        res.status(500).json({

            message:"Server Unavailable"
        })
    }   


}

export default authMiddleware;