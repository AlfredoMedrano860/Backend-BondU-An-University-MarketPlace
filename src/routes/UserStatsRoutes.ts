import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllUserStats, getUserStatsById, createUserStats, updateUserStats, deleteUserStats } from "../controllers/userStatsController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createUserStatsSchema = z.object({
    user_id: z.uuid(),
    rating_avg: z.string().optional(),
    review_count: z.number().int().nonnegative().optional(),
    sales_count: z.number().int().nonnegative().optional(),
});

const updateUserStatsSchema = z.object({
    rating_avg: z.string().optional(),
    review_count: z.number().int().nonnegative().optional(),
    sales_count: z.number().int().nonnegative().optional(),
});

router.get("/", getAllUserStats);
router.get("/:id", validateParams(idSchema), getUserStatsById);
router.post("/", validateBody(createUserStatsSchema), createUserStats);
router.put("/:id", validateParams(idSchema), validateBody(updateUserStatsSchema), updateUserStats);
router.delete("/:id", validateParams(idSchema), deleteUserStats);

export default router;
