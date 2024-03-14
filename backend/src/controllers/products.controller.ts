import { asyncHandler } from "../utils/asynchandler.js";
import { Request } from "express";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { ApiError } from "../utils/apiError.js";
import { rm } from "fs";
import { Product } from "../models/products.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
// import { faker } from "@faker-js/faker";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";



const getlatestProducts = asyncHandler(async (req, res, next) => {
    let products;
  
    if (myCache.has("latest-products"))
      products = JSON.parse(myCache.get("latest-products") as string);
    else {
      products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      myCache.set("latest-products", JSON.stringify(products));
    }
  
    return res.status(200).json(new ApiResponse(200,products,"Latest 5 products are fetched"));


});


const getAllCategories = asyncHandler(async (req, res, next) => {
    let categories;
  
    if (myCache.has("categories"))
      categories = JSON.parse(myCache.get("categories") as string);
    else {
      categories = await Product.distinct("category");
      
      myCache.set("categories", JSON.stringify(categories));
    }
    
    if(!categories) return next(new ApiError(400,"No categories found",false));
    return res.status(200).json(new ApiResponse(200,categories,"all categories are fetched"));
  });
  

const getAdminProducts = asyncHandler(async (req, res, next) => {
    let products;
    if (myCache.has("all-products"))
      products = JSON.parse(myCache.get("all-products") as string);
    else {
    products = await Product.find({});
      myCache.set("all-products", JSON.stringify(products));
    }
  
    return res.status(200).json(new ApiResponse(200,products,"admin products fetched"));
  });


const getSingleProduct = asyncHandler(async (req, res, next) => {
  // console.log("lol");
    let product;
    const {id} = req.params;
    if (myCache.has(`product-${id}`))
      product = JSON.parse(myCache.get(`product-${id}`) as string);
    else {
      product = await Product.findById(id);
  
      if (!product) return next(new ApiError(404,"Product Not Found", false));
  
      myCache.set(`product-${id}`, JSON.stringify(product));
    }
  
    return res.status(200).json(new ApiResponse(200,product,`${product.name}'s description found `));
});


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

  invalidateCache({ product: true, admin: true });

  return res.status(200).json(new ApiResponse(200,product,"product created successfully"));
})


const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req?.file;
    const product = await Product.findById(id);
  
    if (!product) return next(new ApiError(404,"Product Not Found",false));
  
    if (photo) {
      rm(product.photo, () => {
        console.log("Old Photo Deleted");
      });
      product.photo = photo.path;
    }
  
    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;
  
    await product.save({validateBeforeSave:false});
    // deleting previous cache
    invalidateCache({
      product: true,
      productId: String(product._id),
      admin: true,
    });
  
    return res.status(200).json(new ApiResponse(200,product,`${product.name}'s discription updated`));
});

const deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ApiError(404,"Product Not Found", false));
  
    rm(product?.photo, () => {
      console.log("Product Photo Deleted");
    });
  
    await product.deleteOne();
  
    invalidateCache({
      product: true,
      productId: String(product._id),
      admin: true,
    });
  
    return res.status(200).json(new ApiResponse(200,product,"Product deleted"));
});

const getAllProducts = asyncHandler(async (req:Request<{},{},{},SearchRequestQuery>,res,next)=>{
      
    // console.log("lol");
    const { search, sort, category, price } = req.query;

    const page:number = Number(req.query.page)||1;

    const limit:number = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery : BaseQuery = {};

    if (price){
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) baseQuery.category = category;

    if(search) baseQuery.name = {$regex:search,$options:'i'};

    // const filteredProduct = await Product.find(baseQuery)
    // .sort(sort && {price: sort === "asc" ? 1 : -1})
    // .limit(limit)
    // .skip(skip);
    // const searchAllProduct=await  Product.find(baseQuery);
    // const searchAllProduct=await  Product.find({name:"laptop"});
    const [filteredProduct , searchAllProduct] = await Promise.all([

      Product.find(baseQuery)
      .sort(sort && {price: sort === "asc" ? 1 : -1})
      .limit(limit)
      .skip(skip),


      Product.find(baseQuery)
    ])

    if(!filteredProduct) return next(new ApiError(501,"Product not found",false));

    if(!searchAllProduct) return next(new ApiError(501,"Product not found",false));
    // console.log(searchAllProduct);

    const totalPage = Math.ceil(searchAllProduct.length / limit);

    return res.status(200).json(new ApiResponse(200,{filteredProduct,searchAllProduct,tot_page:totalPage}," products fetched"));
})


// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "public\\temp\\65721faf-6a87-4147-9049-3ca112f79ce2.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };
// generateRandomProducts(40);

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };
export {newProduct , getlatestProducts ,getAllCategories, getAdminProducts , getSingleProduct , updateProduct ,deleteProduct , getAllProducts};