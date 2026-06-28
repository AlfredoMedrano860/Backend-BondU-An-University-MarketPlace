import { Router } from "express";
import z from "zod";
import { validateParams } from "../middleware/validations";
import { getUserContactById, updateUserContact } from "../controllers/userContactController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

router.get("/:id", validateParams(idSchema), getUserContactById);
router.put("/:id", validateParams(idSchema), updateUserContact);

export default router;
