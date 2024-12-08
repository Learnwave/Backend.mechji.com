import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";


export const register = async (req,res) => {
            const{name,email,password} = req.body;
            if (!name || !email || !password) {
                return res.json({success:false,message:'missing details'})
            }
            try {
                const existingUser = await userModel.findOne({email});
                if (existingUser) {
                    return res.json({success:false,message:"user already registered"})
                }

                const hashedPassword = await bcrypt.hash(password,10);

                const user = new userModel({name,email,password:hashedPassword});

                await user.save();

                const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

                res.cookie('token',token,{
                    httpOnly : true,
                    secure: process.env.Node_env === 'production',
                    sameSite : process.env.Node_env === 'production' ? "none" : "strict",
                    maxAge : 7 * 24 * 60 * 1000

                });


                // send welcome email 
                const mailOptions = {
                    from : process.env.SENDEREMAILID,
                    to : email,
                    subject : "Welcome To Mechji",
                    text : `Welcome to mechji ! Your Account Has Been Created With Email Id ${email} `
                }

                await transporter.sendMail(mailOptions);

                return res.json({success:true})


            } catch (error) {
                res.json({success:false,message:error.message})
            }
}

export const login = async (req,res) =>{
            const{email,password} = req.body;
            if (!email || !password) {
              return  res.json({success:false,message:"email and password required"})
            }
            try {
                const user = await userModel.findOne({email});
                if (!user) {
                   return res.json({success:false,message:"invalid email"})
                }
                const isMatch = await bcrypt.compare(password,user.password)
                if (!isMatch) {
                  return  res.json({success:"false",message:"invalid password"});
                }


                const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

                res.cookie('token',token,{
                    httpOnly : true,
                    secure: process.env.Node_env === 'production',
                    sameSite : process.env.Node_env === 'production' ? "none" : "strict",
                    maxAge : 7 * 24 * 60 * 1000

                });

                return res.json({success:true})
                
            } catch (error) {
                return res.json({success:false,message: error.message});
            }
}

export const logout = async (req,res)=> {
            try {
                res.clearCookie(token,{
                    httpOnly : true,
                    secure: process.env.Node_env === 'production',
                    sameSite : process.env.Node_env === 'production' ? "none" : "strict",
                    maxAge : 7 * 24 * 60 * 1000

                })
                return res.json({success:true,message:"Logged Out"});
            } catch (error) {
                return res.json({success:false,message: error.message});
            }
}

            // sent verify otp function

export const sentVerifyOtp = async (req,res)=> {
                try {
                    const {userId} = req.body;
                    
                    const user = await userModel.findById(userId);
                    console.log(user)
                    if (user.isAccountVerified) {
                        return res.json({success:false,message:"Acoount Already Verified"})
                    }
                   const OTP = String(Math.floor(100000 + Math.random()* 900000));
                    user.verifyOtp = OTP;
                    user.verifyOtpExpireAt =Date.now() + 24 * 60 * 60 * 1000

                    await user.save();

                    const mailOptions = {   
                        from : process.env.SENDEREMAILID,
                        to : user.email,
                        subject : "Account Verification OTP",
                        text : `Your OTP is ${OTP} . Verify your account using this OTP `
                    }
                    await transporter.sendMail(mailOptions);
                    res.json({success:true, message : "Verification OTP sent on Email"})

                } catch (error) {
                    
                    return res.json({success:false,message: error.message});
                }
    }
                //verify otp function

    export const verifyEmail = async (req,res) => {
                 const {userId,OTP} = req.body;

                 if (!userId || OTP) {
                    return res.json({success:false,message:'Missing Details'});
                 }
                 try {
                    
                    const user = await userModel.findById(userId);
                    if (!user) {
                        return res.json({success:false,message:"User Not Found"})
                    }
                    if (user.verifyOtp = '' || user.verifyOtp !== OTP) {
                        return res.json({success:false,message:"Invalid OTP"})
                    }
                    if(user.verifyOtpExpireAt < Date.now()){
                        return res.json({success:false,message:"OTP Expired"})
                    }
                    user.isAccountVerified = true;
                    user.verifyOtp = '';
                    user.verifyOtpExpireAt = 0;
                    await user.save();
                    return res.json({success:true,message:"Email verified successfully"})
                 } catch (error) {
                    return res.json({success:false,message: error.message});
                 }
    }