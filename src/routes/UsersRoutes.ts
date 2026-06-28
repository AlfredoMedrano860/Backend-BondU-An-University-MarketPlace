import { Router } from "express";
import z from "zod";
import { validateBody, validateParams, validateFile } from "../middleware/validations";
import { upload } from "../middleware/upload";
import { insert_user_schema, update_user_schema } from "../db/schemas/UsersSchema";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUserProducts, getUserReviews, uploadUserAvatar } from "../controllers/usersController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

router.get("/", getAllUsers);
router.get("/:id", validateParams(idSchema), getUserById);
router.get("/:id/products", validateParams(idSchema), getUserProducts);
router.get("/:id/reviews", validateParams(idSchema), getUserReviews);
router.post("/", validateBody(insert_user_schema), createUser);
router.put("/:id", validateParams(idSchema), validateBody(update_user_schema), updateUser);
router.patch("/:id/avatar", validateParams(idSchema), upload.single("avatar"), validateFile({ required: true }), uploadUserAvatar);
router.delete("/:id", validateParams(idSchema), deleteUser);

export default router;
