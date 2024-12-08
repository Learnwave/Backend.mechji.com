import express from "express";
import { registerUser,loginUser, google } from "../controllers/userController.js";
// user router from express
const userRouter = express.Router();


//end points
userRouter.post("/register",registerUser);

userRouter.post("/login",loginUser);

userRouter.post("/google",google)

export default userRouter;


