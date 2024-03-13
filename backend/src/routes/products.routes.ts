import express from "express";
import { checkAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { newProduct } from "../controllers/products.controller.js";

const router = express.Router();


router.route("/new").post(checkAdmin,upload.single("photo") , newProduct);

export default router;

