import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Request } from "express";
import { OrderItemType,NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.model.js";
import { invalidateCache , reduceStock} from "../utils/features.js";
import { myCache } from "../app.js";


const myOrders = asyncHandler(async (req, res, next) => {
    const { id:user } = req.query;
    // console.log(user);
    const key = `my-orders-${user}`;
  
    let orders = [];
  
    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
      orders = await Order.find({ user }).populate("user","name");
      myCache.set(key, JSON.stringify(orders));
    }
    if(orders.length === 0) return res.status(200).json(new ApiResponse(200,orders,`You have No orders`));
    // console.log(orders[0].shippingInfo);
    return res.status(200).json(new ApiResponse(200,orders,`Your -${orders[0]?.user?.name}- orders are fetched`));
});

const allOrders = asyncHandler(async (req, res, next) => {
    const key = `all-orders`;
  
    let orders = [];
  
    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
      orders = await Order.find().populate("user", "name");
      myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json(new ApiResponse(200,orders,`total-order:${orders.length}\n all orders are fetched`));;
});


const getSingleOrder = asyncHandler(async (req,res,next)=>{
    const {id} = req.params;

    const key = `order-${id}`;

    let order;
    // console.log(key)
    if(myCache.has(key) ) {order = JSON.parse(myCache.get(key)as string);}
    else {

        order = await Order.findById(id).populate("user","name");
        if(!order ) return next(new ApiError(404,"order Not found",false));
        myCache.set(key,JSON.stringify(order));
    }
    // console.log()
    return res.status(200).json(new ApiResponse(200,order,`Order of ${order?.user?.name} fetched`));
})


const newOrder = asyncHandler(async(req:Request<{},{},NewOrderRequestBody>,res,next)=>{

    const {shippingInfo,orderItems,user,subtotal,tax,shippingCharges,discount,total} = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
    return next(new ApiError(400,"Please Enter All Fields", false));

    const order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });


    await reduceStock(orderItems);

    invalidateCache({
        product: true,
        order: true,
        admin: true,
        userId: user,
        productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json(new ApiResponse(201,order,"Order created successfully"))
  
})
const processOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    const order = await Order.findById(id);
  
    if (!order) return next(new ApiError(404,"Order Not Found", false));
  
    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }
  
    await order.save({validateBeforeSave:false});
  
    invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(order._id),
    });
  
    return res.status(200).json(new ApiResponse(200,order,"order processed"));
  });

const deleteOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    const order = await Order.findById(id);
    if (!order) return next(new ApiError(404,"Order Not Found", false));
    const name = order?.orderItems[0]?.name;
    await order.deleteOne();
    
    invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(order._id),
    });
  
    return res.status(200).json(new ApiResponse(200,order,`Order of ${name} is deleted`));
});
export {newOrder , getSingleOrder , myOrders , allOrders,processOrder , deleteOrder}