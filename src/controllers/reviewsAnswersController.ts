import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { review_answers } from '../db/schemas/ReviewsAnswersSchema';
import { reviews } from '../db/schemas/ReviewsSchema';
import type { AuthenticatedRequest } from '../middleware/auth';

/**
 * Retorna todas las respuestas a resenas.
 * @param _req - No requiere parametros
 * @param res - 200 con array de respuestas, o 500 en error interno
 */
export const getAllAnswers = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(review_answers);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna una respuesta a resena por su ID.
 * @param req - Params: `id` de la respuesta
 * @param res - 200 con la respuesta, 404 si no existe, o 500 en error interno
 */
export const getAnswerById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(review_answers).where(eq(review_answers.id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Answer not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea una nueva respuesta a una resena. Solo el vendedor reseñado puede responder.
 * @param req - Body: campos de la respuesta
 * @param res - 201 con la respuesta creada, 403 si no es el vendedor reseñado, 404 si la resena no existe, o 500 en error interno
 */
export const createAnswer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [review] = await db.select({ seller_id: reviews.seller_id }).from(reviews).where(eq(reviews.id, req.body.review_id));
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.seller_id !== req.user?.id) {
            return res.status(403).json({ message: 'Only the reviewed seller can answer this review' });
        }

        const data = await db.insert(review_answers).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos de la respuesta indicada por ID. Solo el vendedor reseñado puede editarla.
 * @param req - Params: `id` de la respuesta; Body: campos a actualizar
 * @param res - 200 con la respuesta actualizada, 403 si no es el vendedor reseñado, 404 si no existe, o 500 en error interno
 */
export const updateAnswer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [existing] = await db
            .select({ sellerId: reviews.seller_id })
            .from(review_answers)
            .innerJoin(reviews, eq(review_answers.review_id, reviews.id))
            .where(eq(review_answers.id, req.params.id as string));
        if (!existing) return res.status(404).json({ message: 'Answer not found' });
        if (existing.sellerId !== req.user?.id) {
            return res.status(403).json({ message: 'Only the reviewed seller can edit this answer' });
        }

        const data = await db.update(review_answers).set(req.body).where(eq(review_answers.id, req.params.id as string)).returning();
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una respuesta a resena por su ID. Solo el vendedor reseñado puede eliminarla.
 * @param req - Params: `id` de la respuesta
 * @param res - 200 con mensaje de confirmacion, 403 si no es el vendedor reseñado, 404 si no existe, o 500 en error interno
 */
export const deleteAnswer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [existing] = await db
            .select({ sellerId: reviews.seller_id })
            .from(review_answers)
            .innerJoin(reviews, eq(review_answers.review_id, reviews.id))
            .where(eq(review_answers.id, req.params.id as string));
        if (!existing) return res.status(404).json({ message: 'Answer not found' });
        if (existing.sellerId !== req.user?.id) {
            return res.status(403).json({ message: 'Only the reviewed seller can delete this answer' });
        }

        await db.delete(review_answers).where(eq(review_answers.id, req.params.id as string));
        return res.status(200).json({ message: 'Answer deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
