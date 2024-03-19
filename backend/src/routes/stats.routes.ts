import express from "express"
import { checkAdmin } from "../middlewares/auth.middleware.js";
import { getBarCharts,getDeshboardStats,getLineCharts,getPieCharts } from "../controllers/stats.controller.js";
const router = express.Router();

router.route("/stats").get(checkAdmin,getDeshboardStats);
router.route("/pie").get(checkAdmin,getPieCharts);
router.route("/bar").get(checkAdmin,getBarCharts);
router.route("/line").get(checkAdmin,getLineCharts);

export default router;    