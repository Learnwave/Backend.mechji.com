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
            
         //google authenticating using firebase
    export const google = async (req,res,next) => {
            try {
            const user = await userModel.findOne({email : req.body.email})
            if (user) {
                const token = jwt.sign({id: user._id},process.env.JWT_SECRET);
                const {password : pass , ...rest} = user._doc;
                res
                    .cookie('access_token',token,{httpOnly:true})
                    .status(200)
                    .json(rest);
            }else{
                const genratedPassword = Math.random().toString(36).slice(-8) ;
                const hashedPassword = bcrypt.hashSync(genratedPassword, 10);
                const newUser = new userModel({
                    name : req.body.name ,
                    email : req.body.email,
                    password : hashedPassword,
                    repeat_password : hashedPassword,
                    avatar : req.body.photo
                });
                await newUser.save();
                const token = jwt.sign({id: newUser._id }, process.env.JWT_SECRET);
                const {password:pass , ...rest } = newUser._doc;
                res.cookie("access_token",token, {httpOnly:true}).status(200).json(rest);

            }
            } catch (error) {
                next(error);
            }
        }
    

export {loginUser,registerUser}