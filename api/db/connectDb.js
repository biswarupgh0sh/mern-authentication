import mongoose from "mongoose";
import "dotenv/config";

export const connectDb = async () => {
    try {       
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDb Connected:", conn.connection.host);
    } catch (error) {
        console.log("Problem has occurred:", error.message);
        process.exit(1);
    }
}