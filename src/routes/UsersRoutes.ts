import { Router } from "express";
import z from "zod";
import { validateBody, validateParams, validateFile, validateImageContent } from "../middleware/validations";
import { upload } from "../middleware/upload";
import { authenticateToken } from "../middleware/auth";
import { update_user_schema } from "../db/schemas/UsersSchema";
import { getAllUsers, getUserById, updateUser, deleteUser, getUserProducts, getUserReviews, uploadUserAvatar, changePassword } from "../controllers/usersController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

router.get("/", getAllUsers);
router.get("/:id", validateParams(idSchema), getUserById);
router.get("/:id/products", validateParams(idSchema), getUserProducts);
router.get("/:id/reviews", validateParams(idSchema), getUserReviews);
router.put("/:id", authenticateToken, validateParams(idSchema), validateBody(update_user_schema), updateUser);
router.patch("/:id/avatar", authenticateToken, validateParams(idSchema), upload.single("avatar"), validateFile({ required: true }), validateImageContent, uploadUserAvatar);
router.patch("/:id/password", authenticateToken, validateParams(idSchema), validateBody(changePasswordSchema), changePassword);
router.delete("/:id", authenticateToken, validateParams(idSchema), deleteUser);

export default router;
