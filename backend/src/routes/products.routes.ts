import express from "express";
import { checkAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { newProduct,getlatestProducts,getAllCategories,getAdminProducts,getSingleProduct,updateProduct,deleteProduct , getAllProducts} from "../controllers/products.controller.js";

const router = express.Router();


router.route("/new").post(upload.single("photo") , newProduct);

router.route("/latest").get(getlatestProducts);
router.route("/all").get(getAllProducts);
router.route("/categories").get(getAllCategories);

router.route("/admin-products").get(checkAdmin, getAdminProducts);

router.route("/:id")
    .get(getSingleProduct)
    .put(checkAdmin, upload.single("photo"), updateProduct)
    .delete(checkAdmin, deleteProduct);



export default router;

