import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { authenticateToken } from "../middleware/auth";
import { getAllReviews, getReviewById, createReview, updateReview, deleteReview } from "../controllers/reviewsController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createReviewSchema = z.object({
    reviewer_id: z.uuid(),
    seller_id: z.uuid(),
    rating: z.number().min(0).max(5),
    comment: z.string().optional(),
});

const updateReviewSchema = z.object({
    rating: z.number().min(0).max(5).optional(),
    comment: z.string().optional(),
});

router.get("/", getAllReviews);
router.get("/:id", validateParams(idSchema), getReviewById);
router.post("/", authenticateToken, validateBody(createReviewSchema), createReview);
router.put("/:id", authenticateToken, validateParams(idSchema), validateBody(updateReviewSchema), updateReview);
router.delete("/:id", authenticateToken, validateParams(idSchema), deleteReview);

export default router;
