
import { Product } from "../models/products.model.js";
import { invalidateCatcheProps } from "../types/types.js"
import { myCache } from "../app.js";

const invalidateCache = async({product,order,admin,productId}:invalidateCatcheProps) => {
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
}

export {invalidateCache}