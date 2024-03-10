import mongoose from "mongoose";
import express from "express"
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Database connected || Database Host is ${connectionInstance.connection.host}` )
    } catch (error) {
        console.log("error in database connection " , error)
        throw error;
    }
}

export default connectDB;