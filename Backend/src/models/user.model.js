import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is Required for Authentication"],
        unique:[true,"Email already exist"],
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid Email Fromat"],
    },
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:[true,"username already exist"],
    },
    password:{
        type:String,
        required:[true,"Password is required for authentication"],
    }
});

const userModel = mongoose.model("user",userSchema);

export default userModel;