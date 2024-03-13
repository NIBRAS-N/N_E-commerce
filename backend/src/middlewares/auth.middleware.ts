import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { NextFunction, Request,Response } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";

const checkAdmin = asyncHandler( async (req:Request,res:Response,next:NextFunction) => {
    const {id} = req.query

    if(!id) return next(new ApiError(400,"Please Login first",false));

    const user = await User.findById(id);

    if(!user) return next(new ApiError(400,"User not found in auth.ts",false));

    if(user?.role !== "admin") return next(new ApiError(400,"Sorry, You are not admin" , false));

    next();

})


export {checkAdmin};