
import { Product } from "../models/products.model.js";
import { OrderItemType, invalidateCatcheProps } from "../types/types.js"
import { myCache } from "../app.js";
import { ApiError } from "./apiError.js";

const invalidateCache = async({product,order,admin,productId,userId,orderId}:invalidateCatcheProps) => {
    if(product){
        const productTypes:string[] = ["latest-products","categories","all-products"];
        console.log(productId, " ", typeof productId);
        if(typeof productId === "string") productTypes.push(`product-${productId}`);

        if(typeof productId == "object")productId.forEach(item=>{
            productTypes.push(`product-${item}`);
        })

        // const allProductId = await Product.aggregate([
        //     {
        //         $project:{
        //             _id:1
        //         }
        //     }
        // ]
        // )
        // console.log(allProductId);
        myCache.del(productTypes);        
    }
    if (order) {
        const ordersKeys: string[] = [
          "all-orders",
          `my-orders-${userId}`,
          `order-${orderId}`,
        ];
    
        myCache.del(ordersKeys);
    }
}

const reduceStock = async (orderItems:OrderItemType[]) => {
    for(let i=0;i<orderItems.length;i++){
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if(!product) throw new ApiError(400,"product not found",false);

        product.stock -= order.quantity;
        await product.save({validateBeforeSave:false});
    }
}
export {invalidateCache,reduceStock}