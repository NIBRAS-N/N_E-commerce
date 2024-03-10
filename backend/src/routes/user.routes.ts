
import { Router } from "express";
import { newUser,getAllUsers,getUser,deleteUser } from "../controllers/user.controller.js";

const router = Router();


router.route("/new-user").post(newUser);

router.route("/all").get(getAllUsers);

router.route("/:id").get(getUser).delete(deleteUser);

export default router;
