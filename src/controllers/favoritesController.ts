import type { Request, Response } from 'express';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_favorites } from '../db/schemas/FavoritesSchema';
import { users } from '../db/schemas/UsersSchema';
import { products } from '../db/schemas/ProductsSchema';
import type { AuthenticatedRequest } from '../middleware/auth';

const sellerColumns = {
    id: true, username: true, email: true, avatar: true,
    phone: true, location: true, university: true, career: true,
    created_at: true, updated_at: true,
} as const;

/**
 * Retorna los productos favoritos de un usuario con seller, condición e imágenes.
 */
export const getUserFavorites = async (req: Request, res: Response) => {
    try {
        const user = await db.select({ id: users.id }).from(users).where(eq(users.id, req.params.id as string));
        if (!user.length) return res.status(404).json({ message: 'User not found' });

        const favorites = await db
            .select({ product_id: user_favorites.product_id })
            .from(user_favorites)
            .where(eq(user_favorites.user_id, req.params.id as string));

        if (!favorites.length) return res.status(200).json([]);

        const data = await db.query.products.findMany({
            where: inArray(products.product_id, favorites.map(f => f.product_id)),
            with: {
                seller: { columns: sellerColumns },
                condition: true,
                images: true,
            },
        });

        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/** Agrega un producto a favoritos. Solo el propio usuario puede modificar sus favoritos. */
export const addFavorite = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.params.id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot modify another user\'s favorites' });
        }
        const { product_id } = req.body;

        const [product] = await db.select({ product_id: products.product_id }).from(products).where(eq(products.product_id, product_id));
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const data = await db
            .insert(user_favorites)
            .values({ user_id: req.params.id as string, product_id })
            .onConflictDoNothing()
            .returning();

        if (!data.length) return res.status(409).json({ message: 'Already in favorites' });
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/** Quita un producto de favoritos. Solo el propio usuario puede modificar sus favoritos. */
export const removeFavorite = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.params.id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot modify another user\'s favorites' });
        }
        const data = await db
            .delete(user_favorites)
            .where(
                and(
                    eq(user_favorites.user_id, req.params.id as string),
                    eq(user_favorites.product_id, req.params.productId as string)
                )
            )
            .returning();

        if (!data.length) return res.status(404).json({ message: 'Favorite not found' });
        return res.status(200).json({ message: 'Favorite removed' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
