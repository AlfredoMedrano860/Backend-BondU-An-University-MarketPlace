import type { Request, Response } from 'express';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../db/connection';
import { users, update_user_schema } from '../db/schemas/UsersSchema';
import { deleteFile } from '../utils/fileHelper';
import { deleteProductImageFiles } from '../utils/productImages';
import { hashPassword, comparePasswords } from '../utils/passwords';
import { products } from '../db/schemas/ProductsSchema';
import { reviews } from '../db/schemas/ReviewsSchema';
import type { AuthenticatedRequest } from '../middleware/auth';

const reviewerColumns = {
    id: true, username: true, email: true, avatar: true,
    created_at: true, updated_at: true,
} as const;

/** Columnas seguras de `users` para respuestas de API: nunca incluye el hash de la contraseña. */
const publicUserColumns = {
    id: users.id, username: users.username, email: users.email, avatar: users.avatar,
    phone: users.phone, location: users.location, university: users.university, career: users.career,
    created_at: users.created_at, updated_at: users.updated_at,
} as const;

export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const data = await db.select(publicUserColumns).from(users);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const data = await db.select(publicUserColumns).from(users).where(eq(users.id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/** Solo el propio usuario puede actualizar sus datos. `req.body` ya viene filtrado por `update_user_schema`. */
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.params.id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot update another user' });
        }

        if (req.body.email) {
            const [existing] = await db
                .select({ id: users.id })
                .from(users)
                .where(and(eq(users.email, req.body.email), ne(users.id, req.params.id as string)));
            if (existing) return res.status(409).json({ message: 'Email already in use' });
        }

        const data = await db
            .update(users)
            .set(req.body)
            .where(eq(users.id, req.params.id as string))
            .returning(publicUserColumns);
        if (!data.length) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/** Solo el propio usuario puede cambiar su contraseña, y debe confirmar la actual. */
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id as string;
        if (userId !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot change another user\'s password' });
        }

        const { currentPassword, newPassword } = req.body;
        const [user] = await db.select({ password: users.password }).from(users).where(eq(users.id, userId));
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isValid = await comparePasswords(currentPassword, user.password);
        if (!isValid) return res.status(400).json({ message: 'Current password is incorrect' });

        const hashedPassword = await hashPassword(newPassword);
        await db.update(users).set({ password: hashedPassword, updated_at: new Date() }).where(eq(users.id, userId));
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Solo el propio usuario puede eliminar su cuenta.
 * Borra primero del disco los archivos de sus productos y su avatar; el resto de
 * las filas relacionadas (productos, imagenes, resenas, roles, preferencias,
 * contacto, estadisticas y favoritos) se borran en cascada a nivel de BD.
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id as string;
        if (userId !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot delete another user' });
        }

        const userProducts = await db.select({ product_id: products.product_id }).from(products).where(eq(products.seller_id, userId));
        await Promise.all(userProducts.map(p => deleteProductImageFiles(p.product_id)));

        const [existing] = await db.select({ avatar: users.avatar }).from(users).where(eq(users.id, userId));
        if (existing?.avatar?.includes('/uploads/')) {
            const filename = existing.avatar.split('/uploads/')[1];
            if (filename) await deleteFile(filename).catch(() => {});
        }

        const data = await db
            .delete(users)
            .where(eq(users.id, userId))
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

/** Solo el propio usuario puede subir su avatar. */
export const uploadUserAvatar = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        const userId = req.params.id as string;
        if (userId !== req.user?.id) {
            await deleteFile(req.file.filename);
            return res.status(403).json({ message: 'Cannot update another user\'s avatar' });
        }

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
        const [updated] = await db.update(users).set({ avatar: url }).where(eq(users.id, userId)).returning(publicUserColumns);
        return res.status(200).json(updated);
    } catch {
        if (req.file) await deleteFile(req.file.filename).catch(() => {});
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export { update_user_schema };
