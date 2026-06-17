import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../db/connection";
import { reviews } from "../db/schemas/Reviews";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para reseñas entre usuarios. Montado en `/api/reviews` */
const router = Router();

/** Valida que el parametro `id` sea un UUID valido */
const getReviewsByIdSchema = z.object({
    id: z.uuid(),
});

/** Valida el body para crear una reseña */
const createReviewSchema = z.object({
    reviewer_id: z.uuid(),
    seller_id: z.uuid(),
    rating: z.number().min(0).max(5),
    comment: z.string().optional(),
});

/** Valida el body para actualizar una reseña */
const updateReviewSchema = z.object({
    rating: z.number().min(0).max(5).optional(),
    comment: z.string().optional(),
});

/**
 * Obtiene todas las reseñas registradas.
 * @route GET /api/reviews
 */
router.get("/", async (_, res) => {
    try {
        const data = await db.select().from(reviews);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Obtiene una reseña por su ID.
 * @route GET /api/reviews/:id
 * @param id - UUID de la reseña
 */
router.get("/:id", validateParams(getReviewsByIdSchema), async (req, res) => {
    try {
        const data = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, req.params.id as string));

        if (!data.length) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Crea una nueva reseña.
 * @route POST /api/reviews
 * @param body - `reviewer_id`, `seller_id`, `rating` y opcionalmente `comment`
 */
router.post("/", validateBody(createReviewSchema), async (req, res) => {
    try {
        const data = await db.insert(reviews).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Actualiza una reseña existente.
 * @route PUT /api/reviews/:id
 * @param id - UUID de la reseña
 * @param body - `rating` y/o `comment` a actualizar
 */
router.put("/:id", validateParams(getReviewsByIdSchema), validateBody(updateReviewSchema), async (req, res) => {
    try {
        const data = await db
            .update(reviews)
            .set(req.body)
            .where(eq(reviews.id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Elimina una reseña por su ID.
 * @route DELETE /api/reviews/:id
 * @param id - UUID de la reseña a eliminar
 */
router.delete("/:id", validateParams(getReviewsByIdSchema), async (req, res) => {
    try {
        const data = await db
            .delete(reviews)
            .where(eq(reviews.id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.status(200).json({ message: "Review deleted" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
