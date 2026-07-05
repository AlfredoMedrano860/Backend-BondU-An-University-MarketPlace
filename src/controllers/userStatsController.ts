import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_stats } from '../db/schemas/UserStatsSchema';
import type { AuthenticatedRequest } from '../middleware/auth';

/**
 * Retorna las estadisticas de todos los usuarios.
 * @param _req - No requiere parametros
 * @param res - 200 con array de estadisticas, o 500 en error interno
 */
export const getAllUserStats = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_stats);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna las estadisticas de un usuario por su user_id.
 * @param req - Params: `id` del usuario
 * @param res - 200 con las estadisticas, 404 si no existen, o 500 en error interno
 */
export const getUserStatsById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_stats).where(eq(user_stats.user_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Stats not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un registro de estadisticas para un usuario. Solo para uno mismo.
 * @param req - Body: campos de las estadisticas
 * @param res - 201 con el registro creado, 403 si es para otro usuario, o 500 en error interno
 */
export const createUserStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.body.user_id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot create stats for another user' });
        }
        const data = await db.insert(user_stats).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza las estadisticas del usuario indicado por ID. Solo el dueño puede editarlas.
 * @param req - Params: `id` del registro; Body: campos a actualizar
 * @param res - 200 con el registro actualizado, 403 si no es el dueño, 404 si no existe, o 500 en error interno
 */
export const updateUserStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [existing] = await db.select({ user_id: user_stats.user_id }).from(user_stats).where(eq(user_stats.id, req.params.id as string));
        if (!existing) return res.status(404).json({ message: 'Stats not found' });
        if (existing.user_id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot update another user\'s stats' });
        }

        const data = await db.update(user_stats).set(req.body).where(eq(user_stats.id, req.params.id as string)).returning();
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina las estadisticas de un usuario por su ID. Solo el dueño puede eliminarlas.
 * @param req - Params: `id` del registro de estadisticas
 * @param res - 200 con mensaje de confirmacion, 403 si no es el dueño, 404 si no existe, o 500 en error interno
 */
export const deleteUserStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [existing] = await db.select({ user_id: user_stats.user_id }).from(user_stats).where(eq(user_stats.id, req.params.id as string));
        if (!existing) return res.status(404).json({ message: 'Stats not found' });
        if (existing.user_id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot delete another user\'s stats' });
        }

        await db.delete(user_stats).where(eq(user_stats.id, req.params.id as string));
        return res.status(200).json({ message: 'Stats deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
