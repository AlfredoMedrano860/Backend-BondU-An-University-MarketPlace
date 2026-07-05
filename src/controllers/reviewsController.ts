import type { Request, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { reviews } from '../db/schemas/ReviewsSchema';
import { users } from '../db/schemas/UsersSchema';
import type { AuthenticatedRequest } from '../middleware/auth';

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
 * Crea una nueva resena. El `reviewer_id` debe coincidir con el usuario autenticado.
 * No se permite auto-resena ni mas de una resena por vendedor.
 * @param req - Body: campos de la resena
 * @param res - 201 con la resena creada, 400/403/404/409 en casos invalidos, o 500 en error interno
 */
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.body.reviewer_id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot create a review as another user' });
        }
        if (req.body.seller_id === req.user?.id) {
            return res.status(400).json({ message: 'Cannot review yourself' });
        }

        const [seller] = await db.select({ id: users.id }).from(users).where(eq(users.id, req.body.seller_id));
        if (!seller) return res.status(404).json({ message: 'Seller not found' });

        const [existing] = await db
            .select({ id: reviews.id })
            .from(reviews)
            .where(and(eq(reviews.reviewer_id, req.body.reviewer_id), eq(reviews.seller_id, req.body.seller_id)));
        if (existing) return res.status(409).json({ message: 'You already reviewed this seller' });

        const data = await db.insert(reviews).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos de la resena indicada por ID. Solo quien la escribio puede editarla.
 * @param req - Params: `id` de la resena; Body: campos a actualizar
 * @param res - 200 con la resena actualizada, 403 si no es el autor, 404 si no existe, o 500 en error interno
 */
export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [existing] = await db.select({ reviewer_id: reviews.reviewer_id }).from(reviews).where(eq(reviews.id, req.params.id as string));
        if (!existing) return res.status(404).json({ message: 'Review not found' });
        if (existing.reviewer_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not the author of this review' });
        }

        const data = await db.update(reviews).set(req.body).where(eq(reviews.id, req.params.id as string)).returning();
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una resena por su ID. Solo quien la escribio puede eliminarla.
 * @param req - Params: `id` de la resena
 * @param res - 200 con mensaje de confirmacion, 403 si no es el autor, 404 si no existe, o 500 en error interno
 */
export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [existing] = await db.select({ reviewer_id: reviews.reviewer_id }).from(reviews).where(eq(reviews.id, req.params.id as string));
        if (!existing) return res.status(404).json({ message: 'Review not found' });
        if (existing.reviewer_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not the author of this review' });
        }

        await db.delete(reviews).where(eq(reviews.id, req.params.id as string));
        return res.status(200).json({ message: 'Review deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
