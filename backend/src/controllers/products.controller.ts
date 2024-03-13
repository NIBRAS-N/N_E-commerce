import { asyncHandler } from "../utils/asynchandler.js";
import { Request } from "express";
import { NewProductRequestBody } from "../types/types.js";
import { ApiError } from "../utils/apiError.js";
import { rm } from "fs";
import { Product } from "../models/products.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const newProduct = asyncHandler(async (req:Request<{},{},NewProductRequestBody>,res,next)=>{
    const { name, price, stock, category } = req.body;
    const photo = req?.file;

    if (!photo) return next(new ApiError(400,"Please add Photo", false));

    if (!name || !price || !stock || !category) {
        rm(photo?.path, () => {
          console.log("Deleted");
        });
  
        return next(new ApiError(400,"Please enter All Fields", false));

    }

    const product = await Product.create({
        name,
        price,
        stock,
        category:category.toLocaleLowerCase(),
        photo:photo?.path
    })

    return res.status(200).json(new ApiResponse(200,product,"product created successfully"));
})

export {newProduct};