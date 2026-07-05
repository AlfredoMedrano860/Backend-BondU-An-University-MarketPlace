import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { authenticateToken } from "../middleware/auth";
import { getUserContactById, updateUserContact } from "../controllers/userContactController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const updateContactSchema = z.object({
    bio: z.string().optional(),
    instagram: z.string().optional(),
    telegram: z.string().optional(),
});

router.get("/:id", validateParams(idSchema), getUserContactById);
router.put("/:id", authenticateToken, validateParams(idSchema), validateBody(updateContactSchema), updateUserContact);

export default router;
