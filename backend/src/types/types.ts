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


interface NewProductRequestBody {
    name: string;
    category: string;
    price: number;
    stock: number;
}
  
export {newUserReqBody , controllerType , NewProductRequestBody}