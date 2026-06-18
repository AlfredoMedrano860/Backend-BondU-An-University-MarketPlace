import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { product_status } from '../db/schemas/ProductStatusSchema';

/**
 * Retorna todos los estados de producto (activo, vendido, etc.).
 * @param _req - No requiere parametros
 * @param res - 200 con array de estados, o 500 en error interno
 */
export const getAllStatus = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(product_status);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna un estado de producto por su ID.
 * @param req - Params: `id` del estado
 * @param res - 200 con el estado, 404 si no existe, o 500 en error interno
 */
export const getStatusById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(product_status).where(eq(product_status.status_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Status not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un nuevo estado de producto.
 * @param req - Body: campos del estado
 * @param res - 201 con el estado creado, o 500 en error interno
 */
export const createStatus = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(product_status).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos del estado indicado por ID.
 * @param req - Params: `id` del estado; Body: campos a actualizar
 * @param res - 200 con el estado actualizado, 404 si no existe, o 500 en error interno
 */
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const data = await db.update(product_status).set(req.body).where(eq(product_status.status_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Status not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina un estado de producto por su ID.
 * @param req - Params: `id` del estado
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteStatus = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(product_status).where(eq(product_status.status_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Status not found' });
        return res.status(200).json({ message: 'Status deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
