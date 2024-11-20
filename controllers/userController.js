import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt  from "bcrypt";
import validator from "validator";

// Login user function
const loginUser = async (req,res) => {
            const {email,password} = req.body;
            try {
            //checking user in databse
            const user = await userModel.findOne({email});
            if (!user) {
                res.json({success:false,message:"User Doesn't exists"});
            }
            const isMatch = await bcrypt.compare(password,user.password);
            if (!isMatch) {
                return res.json({success:false,message:"Invalid Credentials"});
            }
            const token = createToken(user._id);
            res.json({success:true,token});
            } catch (error) {
                console.log(error)
                res.json({success:false,message:"Error"});
                
            }
            }
//Token creation function
            const createToken = (id) => {
            return jwt.sign({id},process.env.JWT_SECRET);
            }

// register user function
            const registerUser = async (req,res) =>{
            const {name,email,password,repeat_password} = req.body;
            try {
            //checking user exist or not
            const exists = await userModel.findOne({email});
            if (exists) {
                return res.json({success:false,message:"User Already Exist"})
            }
            //validating email format and strong password
            if(!validator.isEmail(email)){
                res.json({success:false,message:'Please Enter A Valid Email Id'})
            }
            if (password.length < 8 ) {
                return res.json({success:false,message:"Password Length Should Be Equal Or Greater Than 8 "})
            }
            if(password !== repeat_password){
                return res.json({success:false,message:"Please enter the same password in both password fields"})
            }
            // Hashing user password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);

            //create user
            const newUser = new userModel({
                name:name,
                email:email,
                password:hashedPassword,
                repeat_password:hashedPassword
            });
            //saving the user into database
            const user = await newUser.save();

            //create token
             const token = createToken(user._id);
             res.json({success:true,message:token});
        
            } catch (error) {
            
            console.log(error)
            res.json({success:false,message:"error"});
            }
            }

export {loginUser,registerUser}