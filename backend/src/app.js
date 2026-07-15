import express from "express";
const app = express();
import cookieParser from"cookie-parser"
import postRoute from "./routes/post.routes.js";
import authRoute from "./routes/auth.routes.js";


app.use(cookieParser());
app.use(express.json());


app.use("/posts", postRoute);
app.use("/auth", authRoute);

export default app;