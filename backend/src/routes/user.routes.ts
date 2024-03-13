import { Router } from "express";
import { newUser,getAllUsers,getUser,deleteUser } from "../controllers/user.controller.js";
import { checkAdmin } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/new-user").post(newUser);

router.route("/all").get(checkAdmin,getAllUsers);

router.route("/:id").get(getUser).delete(checkAdmin,deleteUser);

export default router;
