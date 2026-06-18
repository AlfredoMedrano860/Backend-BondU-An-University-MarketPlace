import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { notification_types } from '../db/schemas/NotificationTypesSchema';

/**
 * Retorna todos los tipos de notificacion disponibles.
 * @param _req - No requiere parametros
 * @param res - 200 con array de tipos, o 500 en error interno
 */
export const getAllNotificationTypes = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(notification_types);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna un tipo de notificacion por su ID.
 * @param req - Params: `id` del tipo de notificacion
 * @param res - 200 con el tipo, 404 si no existe, o 500 en error interno
 */
export const getNotificationTypeById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(notification_types).where(eq(notification_types.notification_type_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Notification type not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un nuevo tipo de notificacion.
 * @param req - Body: campos del tipo de notificacion
 * @param res - 201 con el tipo creado, o 500 en error interno
 */
export const createNotificationType = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(notification_types).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos del tipo de notificacion indicado por ID.
 * @param req - Params: `id` del tipo; Body: campos a actualizar
 * @param res - 200 con el tipo actualizado, 404 si no existe, o 500 en error interno
 */
export const updateNotificationType = async (req: Request, res: Response) => {
    try {
        const data = await db.update(notification_types).set(req.body).where(eq(notification_types.notification_type_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Notification type not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina un tipo de notificacion por su ID.
 * @param req - Params: `id` del tipo
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteNotificationType = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(notification_types).where(eq(notification_types.notification_type_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Notification type not found' });
        return res.status(200).json({ message: 'Notification type deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
