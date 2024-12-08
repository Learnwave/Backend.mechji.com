import express from "express";
import { login , register,logout,sentVerifyOtp, verifyEmail} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
const authRouter = express.Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.post("/logout",logout);
authRouter.post("/send-verify-otp",userAuth,sentVerifyOtp);
authRouter.post("/verify-account",userAuth,verifyEmail);



export default authRouter;
