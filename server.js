import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import userModel from "./models/userModel.js";
import userRouter from "./routes/userRoute.js";
import 'dotenv/config';




//app config
const app = express();
const port = 4000;

//middleware 
app.use(express.json());
app.use(cors());

//database connection
    connectDb();
//all api end points
app.use("/api/user",userRouter);
app.get("/",(req,res)=>{
    res.send("App is working fine");
})

app.listen(port,()=>{
    console.log(`Server Started On http://localhost:${port}`);
})