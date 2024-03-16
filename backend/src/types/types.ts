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
    userId?: string;    
    orderId?: string;  
}

type OrderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
};
type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
  };

interface NewOrderRequestBody {
    shippingInfo: ShippingInfoType;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItemType[];
}
export {newUserReqBody , controllerType , NewProductRequestBody , SearchRequestQuery , BaseQuery,invalidateCatcheProps , OrderItemType , ShippingInfoType, NewOrderRequestBody}