import { Router } from "express";
import { newCoupon , applyDiscount, allCoupons, deleteCoupon } from "../controllers/paymant-coupon.controller.js";
import { checkAdmin } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/discount").get(applyDiscount)

router.route("/coupon/new").post(checkAdmin,newCoupon)
router.route("/coupon/all").get(checkAdmin,allCoupons)

router.route("/coupon/:id").delete(checkAdmin,deleteCoupon)
export default router;