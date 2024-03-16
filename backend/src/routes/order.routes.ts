import express from "express"
import { newOrder,getSingleOrder,myOrders,allOrders, processOrder ,deleteOrder } from "../controllers/order.controller.js";
import { checkAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.route("/new").post(newOrder);
router.route("/my").get(myOrders);
router.route("/all").get( checkAdmin, allOrders);
router.route("/:id").get(getSingleOrder).put(checkAdmin,processOrder).delete(checkAdmin, deleteOrder);


export default router;