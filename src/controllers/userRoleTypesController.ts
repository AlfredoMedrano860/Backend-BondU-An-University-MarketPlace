import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_role_types } from '../db/schemas/UserRoleTypesSchema';

/**
 * Retorna todos los tipos de rol disponibles en el sistema.
 * @param _req - No requiere parametros
 * @param res - 200 con array de tipos de rol, o 500 en error interno
 */
export const getAllRoleTypes = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_role_types);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna un tipo de rol por su ID.
 * @param req - Params: `id` del tipo de rol
 * @param res - 200 con el tipo de rol, 404 si no existe, o 500 en error interno
 */
export const getRoleTypeById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_role_types).where(eq(user_role_types.role_type_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Role type not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un nuevo tipo de rol.
 * @param req - Body: campos del tipo de rol
 * @param res - 201 con el tipo de rol creado, o 500 en error interno
 */
export const createRoleType = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(user_role_types).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos del tipo de rol indicado por ID.
 * @param req - Params: `id` del tipo de rol; Body: campos a actualizar
 * @param res - 200 con el tipo de rol actualizado, 404 si no existe, o 500 en error interno
 */
export const updateRoleType = async (req: Request, res: Response) => {
    try {
        const data = await db.update(user_role_types).set(req.body).where(eq(user_role_types.role_type_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Role type not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina un tipo de rol por su ID.
 * @param req - Params: `id` del tipo de rol
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteRoleType = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(user_role_types).where(eq(user_role_types.role_type_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Role type not found' });
        return res.status(200).json({ message: 'Role type deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
