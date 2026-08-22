import express from "express"
import cookie from "cookie-parser"


const app = express();

app.use(express.json());
app.use(cookie());

export default app;