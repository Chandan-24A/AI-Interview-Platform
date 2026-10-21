import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB database");
    }catch(err){
        console.error("Failed to connect to DB:", err.message);
        process.exit(1);
    }
}
export default connectDB;