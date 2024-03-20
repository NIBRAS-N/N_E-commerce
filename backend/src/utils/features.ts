
import { Product } from "../models/products.model.js";
import { OrderItemType, invalidateCatcheProps } from "../types/types.js"
import { myCache } from "../app.js";
import { ApiError } from "./apiError.js";
import { ObjectId } from "mongoose";

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

    if (admin) {
        myCache.del([
          "admin-stats",
          "admin-pie-charts",
          "admin-bar-charts",
          "admin-line-charts",
        ]);
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

const calculatePercentage = (thisMonth:number,previousMonth:number)=>{
    if(previousMonth===0) return thisMonth*100;
    const percent= (thisMonth/previousMonth)*100;
    return Number(percent.toFixed(0));
}

const getInventories = async({categories,productsCount}:{
    categories:string[];
    productsCount:number;
})=>{
    // console.log(categories);
    const categoriesCountPromise = categories.map((category)=>
        Product.countDocuments({category})
    )

    const categoriesCount= await Promise.all(categoriesCountPromise);
    
    
    // console.log(categoriesCount);       
    const countingCategory : Record<string,number>[] = [];

    categories.forEach((category, i) => {
        countingCategory.push({
          [category]: Math.round((Number(categoriesCount[i]) / productsCount) * 100)
        });
    });
    
      return countingCategory;
}

interface myDocument extends Document{
    _id?:string;
    createdAt: Date;
    discount?: number;
    total?: number;
}
type funcProp = {
    length:number;
    docArr:myDocument[];
    today:Date;
    property?:"discount"|"total";
}
const getChartData = ({length,docArr,today,property}:funcProp) =>{
    const arr:number[]=new Array(length).fill(0);
    console.log(docArr[0]._id);
    docArr.forEach((i)=>{
        const monthDiff = (today.getMonth() - i.createdAt.getMonth() + 12)%12;

        if(monthDiff<length){
            if(property)arr[length-monthDiff-1]=i[property]!;
            else arr[length-monthDiff-1]+=1;
        }
    })

    return arr;
}
export {invalidateCache , reduceStock , calculatePercentage , getInventories ,getChartData,myDocument}