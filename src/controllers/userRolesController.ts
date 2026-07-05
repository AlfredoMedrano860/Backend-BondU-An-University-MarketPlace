import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_roles } from '../db/schemas/UserRolesSchema';
import type { AuthenticatedRequest } from '../middleware/auth';

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
 * Asigna un rol a un usuario. Solo se puede asignar a uno mismo.
 * @param req - Body: campos del rol a asignar
 * @param res - 201 con el registro creado, 403 si intenta asignarlo a otro usuario, o 500 en error interno
 */
export const createUserRole = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.body.user_id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot assign a role to another user' });
        }
        const data = await db.insert(user_roles).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina el rol asignado a un usuario por su ID. Solo el propio usuario puede quitarse un rol.
 * @param req - Params: `id` del rol asignado
 * @param res - 200 con mensaje de confirmacion, 403 si no es el dueño del rol, 404 si no existe, o 500 en error interno
 */
export const deleteUserRole = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const [existing] = await db.select({ user_id: user_roles.user_id }).from(user_roles).where(eq(user_roles.role_id, req.params.id as string));
        if (!existing) return res.status(404).json({ message: 'User role not found' });
        if (existing.user_id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot remove another user\'s role' });
        }

        await db.delete(user_roles).where(eq(user_roles.role_id, req.params.id as string));
        return res.status(200).json({ message: 'User role deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
