import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../db/connection";
import { review_answers } from "../db/schemas/ReviewsAnswers";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para respuestas a reseñas. Montado en `/api/reviews/answers` */
const router = Router();

/** Valida que el parametro `id` sea un UUID valido */
const getReviewsAnswersByIdSchema = z.object({
    id: z.uuid(),
});

/** Valida el body para crear una respuesta */
const createAnswerSchema = z.object({
    review_id: z.uuid(),
    comment: z.string().min(1),
});

/** Valida el body para actualizar una respuesta */
const updateAnswerSchema = z.object({
    comment: z.string().min(1).optional(),
});

/**
 * Obtiene todas las respuestas a reseñas.
 * @route GET /api/reviews/answers
 */
router.get("/", async (_, res) => {
    try {
        const data = await db.select().from(review_answers);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Obtiene una respuesta por su ID.
 * @route GET /api/reviews/answers/:id
 * @param id - UUID de la respuesta
 */
router.get("/:id", validateParams(getReviewsAnswersByIdSchema), async (req, res) => {
    try {
        const data = await db
            .select()
            .from(review_answers)
            .where(eq(review_answers.id, req.params.id as string));

        if (!data.length) {
            return res.status(404).json({ message: "Answer not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Crea una respuesta a una reseña.
 * @route POST /api/reviews/answers
 * @param body - `review_id` y `comment`
 */
router.post("/", validateBody(createAnswerSchema), async (req, res) => {
    try {
        const data = await db.insert(review_answers).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Actualiza una respuesta existente.
 * @route PUT /api/reviews/answers/:id
 * @param id - UUID de la respuesta
 * @param body - `comment` a actualizar
 */
router.put("/:id", validateParams(getReviewsAnswersByIdSchema), validateBody(updateAnswerSchema), async (req, res) => {
    try {
        const data = await db
            .update(review_answers)
            .set(req.body)
            .where(eq(review_answers.id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "Answer not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Elimina una respuesta por su ID.
 * @route DELETE /api/reviews/answers/:id
 * @param id - UUID de la respuesta a eliminar
 */
router.delete("/:id", validateParams(getReviewsAnswersByIdSchema), async (req, res) => {
    try {
        const data = await db
            .delete(review_answers)
            .where(eq(review_answers.id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "Answer not found" });
        }

        return res.status(200).json({ message: "Answer deleted" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
