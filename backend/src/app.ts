import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import { errorMiddleware } from "./middlewares/error.middleware.js";


const app = express();

app.use(cors({
    
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())


// Importing routes


import userRoute from "./routes/user.routes.js";





//route direction

app.get("/",(req,res)=>{
    return res.send("api/v1 is running")
})

app.use("/api/v1/user", userRoute);


app.use(errorMiddleware);


export {app};