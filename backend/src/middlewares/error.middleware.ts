import { NextFunction,Request,Response } from "express";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const errorMiddleware = (err:ApiError,req:Request,res:Response,next:NextFunction) => {
    err.message ||= "internal Server error";
    err.statuscode ||= 500;
    err.success ||= false;

    if (err.name === "CastError") err.message = "Invalid ID";

    return res.status(err.statuscode).json(new ApiResponse(err.statuscode,{},err.message))
    
}

export {errorMiddleware};