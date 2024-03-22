import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Coupon } from "../models/coupon.model.js";
import { stripe } from "../app.js";

const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new ApiError(400,"Please enter amount", false));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });

  return res.status(201).json(new ApiResponse(201,{ClientSecret: paymentIntent.client_secret},"payment done"));
});




const newCoupon = asyncHandler(async (req, res, next) => {
    const { coupon, amount } = req.body;
  
    if (!coupon || !amount)
      return next(new ApiError(400,"Please enter both coupon and amount", false));
  
    const cpn = await Coupon.create({ code: coupon, amount });
  
    return res.status(201).json(new ApiResponse(201,cpn,`Coupun ${cpn.code} created`));
});


const applyDiscount = asyncHandler(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ApiError(400,"Invalid Coupon Code", false));

  return res.status(200).json(new ApiResponse(200,discount, `Discount of ${discount.amount} done`));;
});

const allCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find({});
  if(coupons.length === 0 ) return res.status(200).json(new ApiResponse(200,coupons,"No Coupns available"));


  return res.status(200).json(new ApiResponse(200,coupons,`total ${coupons.length}  Coupns available`))
});


const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) return next(new ApiError(400,"Invalid Coupon ID", false));

  return res.status(200).json(new ApiResponse(200,coupon,`Coupon ${coupon.code} deleted`));
});
export {newCoupon , applyDiscount , allCoupons , deleteCoupon , createPaymentIntent}