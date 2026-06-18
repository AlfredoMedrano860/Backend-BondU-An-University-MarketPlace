import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { products } from '../db/schemas/ProductsSchema';

/**
 * Retorna todos los productos disponibles en el marketplace.
 * @param _req - No requiere parametros
 * @param res - 200 con array de productos, o 500 en error interno
 */
export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(products);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna un producto por su ID.
 * @param req - Params: `id` del producto
 * @param res - 200 con el producto, 404 si no existe, o 500 en error interno
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(products).where(eq(products.product_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea un nuevo producto con los datos del body.
 * @param req - Body: campos del producto
 * @param res - 201 con el producto creado, o 500 en error interno
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
 * @param req - Params: `id` del producto; Body: campos a actualizar
 * @param res - 200 con el producto actualizado, 404 si no existe, o 500 en error interno
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const data = await db.update(products).set(req.body).where(eq(products.product_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina un producto por su ID.
 * @param req - Params: `id` del producto
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(products).where(eq(products.product_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json({ message: 'Product deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
