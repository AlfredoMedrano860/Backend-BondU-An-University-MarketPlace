import type { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { products } from '../db/schemas/ProductsSchema';
import { product_images } from '../db/schemas/ProductImagesSchema';
import { products_categories } from '../db/schemas/ProductCategoriesSchema';
import { user_stats } from '../db/schemas/UserStatsSchema';

const sellerColumns = {
    id: true, username: true, email: true, avatar: true,
    phone: true, location: true, university: true, career: true,
    created_at: true, updated_at: true,
} as const;

const withRelations = {
    seller: { columns: sellerColumns },
    condition: true,
    images: true,
} as const;

/**
 * Retorna todos los productos con seller, condición e imágenes.
 */
export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const data = await db.query.products.findMany({ with: withRelations });
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna un producto por su ID con seller, condición e imágenes.
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const data = await db.query.products.findFirst({
            where: eq(products.product_id, req.params.id as string),
            with: withRelations,
        });
        if (!data) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un nuevo producto.
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(products).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos del producto indicado por ID.
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const data = await db
            .update(products)
            .set(req.body)
            .where(eq(products.product_id, req.params.id as string))
            .returning();
        if (!data.length) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina un producto por su ID.
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await db.delete(product_images).where(eq(product_images.product_id, id));
        await db.delete(products_categories).where(eq(products_categories.product_id, id));
        const data = await db.delete(products).where(eq(products.product_id, id)).returning();
        if (!data.length) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json({ message: 'Product deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const sellProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const product = await db.query.products.findFirst({ where: eq(products.product_id, id) });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.seller_id) {
            await db
                .update(user_stats)
                .set({ sales_count: sql`${user_stats.sales_count} + 1`, updated_at: new Date() })
                .where(eq(user_stats.user_id, product.seller_id));
        }

        await db.delete(product_images).where(eq(product_images.product_id, id));
        await db.delete(products_categories).where(eq(products_categories.product_id, id));
        await db.delete(products).where(eq(products.product_id, id));

        return res.status(200).json({ message: 'Product sold' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
