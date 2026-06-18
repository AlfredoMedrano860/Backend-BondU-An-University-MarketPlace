import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { product_categories } from '../db/schemas/ProductCategoriesSchema';

/**
 * Retorna todas las categorias de producto.
 * @param _req - No requiere parametros
 * @param res - 200 con array de categorias, o 500 en error interno
 */
export const getAllCategories = async (_req: Request, res: Response) => {
    try {
        const data = await db.select().from(product_categories);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Retorna una categoria por su ID.
 * @param req - Params: `id` de la categoria
 * @param res - 200 con la categoria, 404 si no existe, o 500 en error interno
 */
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(product_categories).where(eq(product_categories.category_id, req.params.id as string));
        if (!data.length) return res.status(404).json({ message: 'Category not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Crea una nueva categoria de producto.
 * @param req - Body: campos de la categoria
 * @param res - 201 con la categoria creada, o 500 en error interno
 */
export const createCategory = async (req: Request, res: Response) => {
    try {
        const data = await db.insert(product_categories).values(req.body).returning();
        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Actualiza los campos de la categoria indicada por ID.
 * @param req - Params: `id` de la categoria; Body: campos a actualizar
 * @param res - 200 con la categoria actualizada, 404 si no existe, o 500 en error interno
 */
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const data = await db.update(product_categories).set(req.body).where(eq(product_categories.category_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Category not found' });
        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una categoria por su ID.
 * @param req - Params: `id` de la categoria
 * @param res - 200 con mensaje de confirmacion, 404 si no existe, o 500 en error interno
 */
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const data = await db.delete(product_categories).where(eq(product_categories.category_id, req.params.id as string)).returning();
        if (!data.length) return res.status(404).json({ message: 'Category not found' });
        return res.status(200).json({ message: 'Category deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
