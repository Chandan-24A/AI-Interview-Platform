import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required"],
        unique:[true,"Token Must be unique"]
    }
},{
    timestamps:true
})

blackListSchema.index(
    {createdAt:1},
    {expireAfterSeconds: 60*60*24*3}  // deletes token automatically after 3 days
)

const blackListModel = mongoose.model("tokenblacklist",blackListSchema);

export default blackListModel;