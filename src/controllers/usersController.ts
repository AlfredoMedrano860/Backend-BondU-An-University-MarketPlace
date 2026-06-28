import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users, insert_user_schema, update_user_schema } from '../db/schemas/UsersSchema';
import { deleteFile } from '../utils/fileHelper';
import { products } from '../db/schemas/ProductsSchema';
import { reviews } from '../db/schemas/ReviewsSchema';

const reviewerColumns = {
    id: true, username: true, email: true, avatar: true,
    created_at: true, updated_at: true,
} as const;

export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(users);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(users).where(eq(users.id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(users).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const data = await db
            .update(users)
            .set(req.body)
            .where(eq(users.id, req.params.id as string))
            .returning();
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const data = await db
            .delete(users)
            .where(eq(users.id, req.params.id as string))
            .returning();
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ message: 'User deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna los productos publicados por un usuario con condición e imágenes.
 */
export const getUserProducts = async (req: Request, res: Response) => {
    try {
        const user = await db.select({ id: users.id }).from(users).where(eq(users.id, req.params.id as string));
        if (!user.length) return res.status(404).json({ message: 'User not found' });

        const data = await db.query.products.findMany({
            where: eq(products.seller_id, req.params.id as string),
            with: { condition: true, images: true },
        });
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna las reseñas recibidas por un vendedor incluyendo datos del reviewer.
 */
export const getUserReviews = async (req: Request, res: Response) => {
    try {
        const user = await db.select({ id: users.id }).from(users).where(eq(users.id, req.params.id as string));
        if (!user.length) return res.status(404).json({ message: 'User not found' });

        const data = await db.query.reviews.findMany({
            where: eq(reviews.seller_id, req.params.id as string),
            with: { reviewer: { columns: reviewerColumns } },
        });
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const uploadUserAvatar = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        const userId = req.params.id as string;
        const [user] = await db.select({ avatar: users.avatar }).from(users).where(eq(users.id, userId));
        if (!user) {
            await deleteFile(req.file.filename);
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.avatar?.includes('/uploads/')) {
            const oldFilename = user.avatar.split('/uploads/')[1];
            if (oldFilename) await deleteFile(oldFilename).catch(() => {});
        }

        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        const [updated] = await db.update(users).set({ avatar: url }).where(eq(users.id, userId)).returning();
        return res.status(200).json(updated);
    } catch {
        if (req.file) await deleteFile(req.file.filename).catch(() => {});
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export { insert_user_schema, update_user_schema };
