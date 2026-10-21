import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
    console.log(`Server is Running on port: ${port}`);
});
