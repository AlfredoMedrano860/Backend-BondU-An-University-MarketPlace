import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllPreferences, getPreferencesById, createPreferences, updatePreferences, deletePreferences } from "../controllers/userPreferencesController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createUserPreferencesSchema = z.object({
    user_id: z.uuid(),
    notifications: z.boolean().optional(),
    language: z.string().optional(),
});

const updateUserPreferencesSchema = z.object({
    notifications: z.boolean().optional(),
    language: z.string().optional(),
});

router.get("/", getAllPreferences);
router.get("/:id", validateParams(idSchema), getPreferencesById);
router.post("/", validateBody(createUserPreferencesSchema), createPreferences);
router.put("/:id", validateParams(idSchema), validateBody(updateUserPreferencesSchema), updatePreferences);
router.delete("/:id", validateParams(idSchema), deletePreferences);

export default router;
