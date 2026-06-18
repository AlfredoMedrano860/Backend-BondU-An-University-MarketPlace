import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users, insert_user_schema, update_user_schema } from '../db/schemas/UsersSchema';

/**
 * Retorna todos los usuarios registrados en la plataforma.
 * @param _req - No requiere parametros
 * @param res - 200 con array de usuarios, o 500 en error interno
 */
export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(users);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna un usuario por su ID.
 * @param req - Params: `id` del usuario
 * @param res - 200 con el usuario, 404 si no existe, o 500 en error interno
 */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(users).where(eq(users.id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un nuevo usuario con los datos del body.
 * @param req - Body: campos del usuario segun `insert_user_schema`
 * @param res - 201 con el usuario creado, o 500 en error interno
 */
export const createUser = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(users).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos del usuario indicado por ID.
 * @param req - Params: `id` del usuario; Body: campos a actualizar segun `update_user_schema`
 * @param res - 200 con el usuario actualizado, 404 si no existe, o 500 en error interno
 */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const data = await db.update(users).set(req.body).where(eq(users.id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina un usuario por su ID.
 * @param req - Params: `id` del usuario
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(users).where(eq(users.id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ message: 'User deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export { insert_user_schema, update_user_schema };
