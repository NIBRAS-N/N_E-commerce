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
type SearchRequestQuery = {
    search?: string;
    price?: string;
    category?: string;
    sort?: string;
    page?: string;
};
  
interface   BaseQuery {
    name?: {
      $regex: string;
      $options: string;
    };
    price?: { $lte: number };
    category?: string;
}

type invalidateCatcheProps = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
    productId?: string | string[];
}
export {newUserReqBody , controllerType , NewProductRequestBody , SearchRequestQuery , BaseQuery,invalidateCatcheProps}