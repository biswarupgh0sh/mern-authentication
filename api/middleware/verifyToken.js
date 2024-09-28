import jwt from "jsonwebtoken";
import "dotenv/config";

export const verifyToken = (req, res, next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({ success: false, message: "Token expired"}); //unauthorized
    }
    try {
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifiedToken){
            return res.status(403).json({ success: false, message: "Incorrect token"}); //forbidden
        }

        req.userId = verifiedToken.userId;
    } catch (error) {
        console.log("Error in verifying token", error);
        throw new Error("Error in verifying token", error.message);
    }
    next();
}