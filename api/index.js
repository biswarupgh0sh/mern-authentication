import express from "express";
import authRoutes from "./routes/auth.route.js";
import { connectDb } from "./db/connectDb.js";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true}));

app.get("/", (req, res)=>{
    res.send("Home")
})

app.use("/auth", authRoutes);

if(process.env.NODE_ENV=="production"){
    app.use(express.static(path.join(__dirname, "/client/dist")));

    app.get("*", (req, res)=> {
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    })
}


app.listen(port, ()=>{
    connectDb();
    console.log(`Connected to ${port}`);
});