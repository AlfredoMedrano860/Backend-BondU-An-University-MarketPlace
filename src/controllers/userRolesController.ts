import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_roles } from '../db/schemas/UserRolesSchema';

/**
 * Retorna todos los roles asignados a usuarios.
 * @param _req - No requiere parametros
 * @param res - 200 con array de roles, o 500 en error interno
 */
export const getAllUserRoles = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_roles);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna un rol de usuario por su ID.
 * @param req - Params: `id` del rol asignado
 * @param res - 200 con el rol, 404 si no existe, o 500 en error interno
 */
export const getUserRoleById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(user_roles).where(eq(user_roles.role_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'User role not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Asigna un rol a un usuario.
 * @param req - Body: campos del rol a asignar
 * @param res - 201 con el registro creado, o 500 en error interno
 */
export const createUserRole = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(user_roles).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina el rol asignado a un usuario por su ID.
 * @param req - Params: `id` del rol asignado
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteUserRole = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(user_roles).where(eq(user_roles.role_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'User role not found' });
        return res.status(200).json({ message: 'User role deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
