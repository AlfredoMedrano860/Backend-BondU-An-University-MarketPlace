import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllAnswers, getAnswerById, createAnswer, updateAnswer, deleteAnswer } from "../controllers/reviewsAnswersController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createAnswerSchema = z.object({
    review_id: z.uuid(),
    comment: z.string().min(1),
});

const updateAnswerSchema = z.object({
    comment: z.string().min(1).optional(),
});

router.get("/", getAllAnswers);
router.get("/:id", validateParams(idSchema), getAnswerById);
router.post("/", validateBody(createAnswerSchema), createAnswer);
router.put("/:id", validateParams(idSchema), validateBody(updateAnswerSchema), updateAnswer);
router.delete("/:id", validateParams(idSchema), deleteAnswer);

export default router;
