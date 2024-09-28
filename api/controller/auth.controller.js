import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { resetPasswordEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";
import crypto from "crypto";
import "dotenv/config";

export const signup = async (req, res) => {
    const { email, name, password } = req.body;

    try {
        if(!email || !name || !password){
            throw new Error("All fields are required");
        }
        
        const userAlreadyExists = await User.findOne({ email });
        
        if(userAlreadyExists){
            return res.status(400).send({success: false, message: "User already exists"});
        }
    
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random()*90000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken: verificationCode,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        });
        
        await user.save();
        

        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationCode);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        res.status(400).send({ success: false, message: error.message});
    }
}
export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ success: false, message: "Invalid credentials"});
        }
        
        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(400).json({ success: false, message: "Invalid Password"})
        }        

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = Date.now()
        await user.save();
         
        return res.status(200).json({ success: true, message: "Logged in successfully", user:{
            ...user._doc,
            password: undefined
        }});
    } catch (error) {
        console.log("Error while logging in");
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const logout = async (req, res) => {
    await res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logged out successfully"});
}

export const verifyEmail = async (req, res) =>{
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt : Date.now() }
        });

        console.log("user", user);
        
        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired Code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();
        

        await sendWelcomeEmail(user.email, user.name);
        console.log("email is sent after verification");
        

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user:{
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        console.log("Error in verifying email", error);
        return await res.status(500).json({success: false, message: error.message});
    }
}

export const forgotPassword = async (req, res)=>{
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({sucess: false, message: "There is no id with this email id"});
        }

        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;

        await user.save();

        await resetPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);        

        return res.status(200).json({ success: true, message: "Forgot password link is sent to the email id", user:{
            ...user._doc,
            password: undefined
        }})
    } catch (error) {
        console.log("Error processing forgot password", error);
        throw new Error("Error handing forgot password", error.message);
    }
}

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: { $gt: Date.now() }
        });
        
        if(!user){
            return res.status(400).json({ success: false, message: "The link Expired"});
        }        

        const newHashedPassword = await bcryptjs.hash(password, 10); 
        user.password = newHashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;

        await user.save();

        await sendResetSuccessEmail(user.email);

        return res.status(200).json({ success: true, message: "Password reset successfull", user: {
            ...user._doc,
            password: undefined
        }});
    } catch (error) {
        console.log("Error while resetting the password", error);
    }
}
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json({ success: false, message: "Identification error"});
        }

        return res.status(200).json({success: true, message: "Correct Authentication", user:{
            ...user._doc,
            password: undefined
        }});
    } catch (error) {
        console.log("Error in auth", error);
        throw new Error("Auth error", error.message);
    }
}