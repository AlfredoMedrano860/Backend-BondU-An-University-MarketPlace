import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { reviews } from '../db/schemas/ReviewsSchema';

/**
 * Retorna todas las resenas registradas en el sistema.
 * @param _req - No requiere parametros
 * @param res - 200 con array de resenas, o 500 en error interno
 */
export const getAllReviews = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(reviews);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna una resena por su ID.
 * @param req - Params: `id` de la resena
 * @param res - 200 con la resena, 404 si no existe, o 500 en error interno
 */
export const getReviewById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(reviews).where(eq(reviews.id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Review not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea una nueva resena.
 * @param req - Body: campos de la resena
 * @param res - 201 con la resena creada, o 500 en error interno
 */
export const createReview = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(reviews).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos de la resena indicada por ID.
 * @param req - Params: `id` de la resena; Body: campos a actualizar
 * @param res - 200 con la resena actualizada, 404 si no existe, o 500 en error interno
 */
export const updateReview = async (req: Request, res: Response) => {
    try {
        const data = await db.update(reviews).set(req.body).where(eq(reviews.id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Review not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una resena por su ID.
 * @param req - Params: `id` de la resena
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(reviews).where(eq(reviews.id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Review not found' });
        return res.status(200).json({ message: 'Review deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
