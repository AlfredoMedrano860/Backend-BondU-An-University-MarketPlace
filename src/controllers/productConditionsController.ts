import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { product_conditions } from '../db/schemas/ProductConditionsSchema';

/**
 * Retorna todas las condiciones de producto (nuevo, usado, etc.).
 * @param _req - No requiere parametros
 * @param res - 200 con array de condiciones, o 500 en error interno
 */
export const getAllConditions = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(product_conditions);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna una condicion de producto por su ID.
 * @param req - Params: `id` de la condicion
 * @param res - 200 con la condicion, 404 si no existe, o 500 en error interno
 */
export const getConditionById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(product_conditions).where(eq(product_conditions.condition_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Condition not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea una nueva condicion de producto.
 * @param req - Body: campos de la condicion
 * @param res - 201 con la condicion creada, o 500 en error interno
 */
export const createCondition = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(product_conditions).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos de la condicion indicada por ID.
 * @param req - Params: `id` de la condicion; Body: campos a actualizar
 * @param res - 200 con la condicion actualizada, 404 si no existe, o 500 en error interno
 */
export const updateCondition = async (req: Request, res: Response) => {
    try {
        const data = await db.update(product_conditions).set(req.body).where(eq(product_conditions.condition_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Condition not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una condicion de producto por su ID.
 * @param req - Params: `id` de la condicion
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteCondition = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(product_conditions).where(eq(product_conditions.condition_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Condition not found' });
        return res.status(200).json({ message: 'Condition deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
