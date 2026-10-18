import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: String,
    difficulty: String,
    timeLimit: Number,
    answer: String,
    feedback: String,
    score:{
        type: Number,
        default:0
    },
    confidence:{
        type:Number,
        default:0
    },
    communication:{
        type: Number,
        default:0,
    },
    correctness:{
        type: Number,
        default:0
    }
});

const interviewSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    role:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    mode:{
        type:String,
        enum:["HR","Technical"],
        required:true
    },
    resumeText:{
        type:String
    },
    questions:[questionSchema],
    finalScore:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["Incompleted","Completed"],
        default:"Incompleted"
    }


},{timestamps:true});

const interviewModel = mongoose.model("interview",interviewSchema);

export default interviewModel;