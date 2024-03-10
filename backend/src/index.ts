import dotenv from "dotenv"
import mongoose from "mongoose"
import { DB_NAME } from "./constants.js"
import express from "express"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.on("error" , (error)=>{
        console.log("error in src || index.js")
    })

    app.listen(process.env.PORT || 4000 , ()=>{
        console.log(`server is running at ${process.env.PORT}`);
    })
}).catch((error)=>{
    console.error("failed database connection or server connection at src || index.js", error)
})