import express from "express";
import { registerUser,loginUser } from "../controllers/userController.js";
// user router from express
const userRouter = express.Router();


//end points
userRouter.post("/register",registerUser);

userRouter.post("/login",loginUser);

export default userRouter;


