import type { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { products } from '../db/schemas/ProductsSchema';
import { product_status } from '../db/schemas/ProductStatusSchema';
import { user_stats } from '../db/schemas/UserStatsSchema';
import { assignRoleIfMissing } from '../utils/roles';
import { deleteProductImageFiles } from '../utils/productImages';
import { handleDbError } from '../utils/dbErrors';
import type { AuthenticatedRequest } from '../middleware/auth';

const sellerColumns = {
    id: true, username: true, email: true, avatar: true,
    phone: true, location: true, university: true, career: true,
    created_at: true, updated_at: true,
} as const;

const withRelations = {
    seller: { columns: sellerColumns },
    condition: true,
    status: true,
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
 * Crea un nuevo producto. El `seller_id` debe coincidir con el usuario autenticado.
 * Al publicar su primer producto, el usuario pasa a tener también el rol "seller".
 */
export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.body.seller_id !== req.user?.id) {
            return res.status(403).json({ message: 'Cannot create a product for another user' });
        }
        const data = await db.insert(products).values(req.body).returning();
        await assignRoleIfMissing(req.user!.id, 'seller');
        return res.status(201).json(data[0]);
    } catch (error) {
        return handleDbError(error, res);
    }
};

/**
 * Actualiza los campos del producto indicado por ID. Solo el vendedor dueño puede modificarlo.
 */
export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const [existing] = await db.select({ seller_id: products.seller_id }).from(products).where(eq(products.product_id, id));
        if (!existing) return res.status(404).json({ message: 'Product not found' });
        if (existing.seller_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not the owner of this product' });
        }

        const data = await db
            .update(products)
            .set(req.body)
            .where(eq(products.product_id, id))
            .returning();
        return res.status(200).json(data[0]);
    } catch (error) {
        return handleDbError(error, res);
    }
};

/**
 * Elimina un producto por su ID. Solo el vendedor dueño puede eliminarlo.
 * Tambien borra del disco los archivos de sus imagenes.
 */
export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const [existing] = await db.select({ seller_id: products.seller_id }).from(products).where(eq(products.product_id, id));
        if (!existing) return res.status(404).json({ message: 'Product not found' });
        if (existing.seller_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not the owner of this product' });
        }

        // Borra los archivos en disco; las filas de product_images cascadean al borrar el producto
        await deleteProductImageFiles(id);
        await db.delete(products).where(eq(products.product_id, id));
        return res.status(200).json({ message: 'Product deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Marca un producto como vendido: actualiza su `status_id` a "Vendido" (no lo borra)
 * y suma una venta a las estadisticas del vendedor.
 */
export const sellProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const product = await db.query.products.findFirst({ where: eq(products.product_id, id) });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.seller_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not the owner of this product' });
        }

        const [vendido] = await db.select({ status_id: product_status.status_id }).from(product_status).where(eq(product_status.name_status, 'Vendido'));
        if (!vendido) return res.status(500).json({ message: 'Vendido status not found' });

        if (product.seller_id) {
            await db
                .update(user_stats)
                .set({ sales_count: sql`${user_stats.sales_count} + 1`, updated_at: new Date() })
                .where(eq(user_stats.user_id, product.seller_id));
        }

        await db.update(products).set({ status_id: vendido.status_id, updated_at: new Date() }).where(eq(products.product_id, id));

        return res.status(200).json({ message: 'Product sold' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
