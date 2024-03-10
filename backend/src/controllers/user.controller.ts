import { NextFunction, Request,Response } from "express"
import { newUserReqBody } from "../types/types.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { User } from "../models/user.model.js"


const newUser = asyncHandler ( async(
        req:Request<{},{},newUserReqBody>,
        res:Response,
        next:NextFunction
    )=>{
        
        
        const {name,email,photo,gender,_id,dob}=req.body;
        
        let user = await User.findById(_id);
        
        if(user){
            return res.status(200).json(new ApiResponse(200,user,`welcome ${user.name}`))
        }
        
        if([name,email,photo,gender].some((item)=>item?.trim()==="")){
            return next(new ApiError(400,"Enter every information",false));
        }

        user = await User.create({
            name,
            email,
            photo,
            gender,
            _id,
            dob : new Date(dob)
        })

        return res.status(200).json(new ApiResponse(200,user,`All ok , Congratulation, ${user.name} is created`));
    }
)


const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({});
  
    return res.status(200).json(new ApiResponse(200,users,"All user are fetched"));
});


  
const getUser = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
  
    if (!user) return next(new ApiError(400,"Invalid Id", false));
  
    return res.status(200).json(new ApiResponse(200,user,`user ${user.name} found`));
});


const deleteUser = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    
    if (!user) return next(new ApiError(400,"Invalid Id",false));
  
    await user.deleteOne();
    
    return res.status(200).json(new ApiResponse(200,user,`data of ${user.name} is deleted`));
  });
export {newUser,getAllUsers,getUser,deleteUser}