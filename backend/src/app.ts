import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import { errorMiddleware } from "./middlewares/error.middleware.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import Stripe from "stripe";

const app = express();

app.use(cors({
    
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
))

const stripeKey = process.env.STRIPE_KEY || "";

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())
app.use(morgan("dev"))

// Importing routes


import userRoute from "./routes/user.routes.js";
import productRoute from "./routes/products.routes.js"
import orderRoute from "./routes/order.routes.js"
import couponRoute from "./routes/paymant-coupon.routes.js"
import statRoute from "./routes/stats.routes.js"

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

//route direction

app.get("/",(req,res)=>{
    return res.send("api/v1 is running")
})

app.use("/api/v1/user", userRoute);

app.use("/api/v1/product",productRoute);

app.use("/api/v1/order",orderRoute);

app.use("/api/v1/payment",couponRoute);

app.use("/api/v1/stats",statRoute);
app.use("/uploads", express.static("/public/temp"));
app.use(errorMiddleware);


export {app};