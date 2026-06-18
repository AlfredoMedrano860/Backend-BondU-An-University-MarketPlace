import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { notifications } from '../db/schemas/NotificationsSchema';

/**
 * Retorna todas las notificaciones del sistema.
 * @param _req - No requiere parametros
 * @param res - 200 con array de notificaciones, o 500 en error interno
 */
export const getAllNotifications = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(notifications);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna una notificacion por su ID.
 * @param req - Params: `id` de la notificacion
 * @param res - 200 con la notificacion, 404 si no existe, o 500 en error interno
 */
export const getNotificationById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(notifications).where(eq(notifications.notification_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Notification not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea una nueva notificacion.
 * @param req - Body: campos de la notificacion
 * @param res - 201 con la notificacion creada, o 500 en error interno
 */
export const createNotification = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(notifications).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos de la notificacion indicada por ID.
 * @param req - Params: `id` de la notificacion; Body: campos a actualizar
 * @param res - 200 con la notificacion actualizada, 404 si no existe, o 500 en error interno
 */
export const updateNotification = async (req: Request, res: Response) => {
    try {
        const data = await db.update(notifications).set(req.body).where(eq(notifications.notification_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Notification not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una notificacion por su ID.
 * @param req - Params: `id` de la notificacion
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(notifications).where(eq(notifications.notification_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Notification not found' });
        return res.status(200).json({ message: 'Notification deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
