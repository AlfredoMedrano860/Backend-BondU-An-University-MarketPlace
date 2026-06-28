import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_preferences } from '../db/schemas/UserPreferencesSchema';

/**
 * Retorna las preferencias de todos los usuarios.
 * @param _req - No requiere parametros
 * @param res - 200 con array de preferencias, o 500 en error interno
 */
export const getAllPreferences = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_preferences);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna las preferencias de un usuario por su ID.
 * @param req - Params: `id` del registro de preferencias
 * @param res - 200 con las preferencias, 404 si no existen, o 500 en error interno
 */
export const getPreferencesById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_preferences).where(eq(user_preferences.user_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Preferences not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un registro de preferencias para un usuario.
 * @param req - Body: campos de las preferencias
 * @param res - 201 con el registro creado, o 500 en error interno
 */
export const createPreferences = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(user_preferences).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza las preferencias del usuario indicado por ID.
 * @param req - Params: `id` del registro; Body: campos a actualizar
 * @param res - 200 con las preferencias actualizadas, 404 si no existen, o 500 en error interno
 */
export const updatePreferences = async (req: Request, res: Response) => {
    try {
        const data = await db.update(user_preferences).set(req.body).where(eq(user_preferences.user_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Preferences not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina las preferencias de un usuario por su ID.
 * @param req - Params: `id` del registro de preferencias
 * @param res - 200 con mensaje de confirmacion, 404 si no existen, o 500 en error interno
 */
export const deletePreferences = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(user_preferences).where(eq(user_preferences.user_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Preferences not found' });
        return res.status(200).json({ message: 'Preferences deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
