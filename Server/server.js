// Polyfill Promise.withResolvers for Node runtimes < 22 (e.g. Node 20 on Render / Docker)
if (typeof Promise.withResolvers !== "function") {
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
    console.log(`Server is Running on port: ${port}`);
});
