import { NextFunction,Request,Response } from "express";


interface newUserReqBody {
    name:string;
    email:string;
    photo:string;
    gender:string;
    _id:string;
    dob:Date;
}

type controllerType = (
    req: Request,
    res: Response,
    next: NextFunction
)=> Promise<void | Response<any, Record<string, any>>>

export {newUserReqBody , controllerType}