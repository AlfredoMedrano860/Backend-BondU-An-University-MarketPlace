import type { Request, Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { product_images } from '../db/schemas/ProductImagesSchema';
import { products } from '../db/schemas/ProductsSchema';
import { deleteFile } from '../utils/fileHelper';
import type { AuthenticatedRequest } from '../middleware/auth';

const MAX_IMAGES = 4;

/** Señaliza dentro de la transaccion que ya se alcanzo el limite de imagenes. */
class MaxImagesError extends Error {}

/**
 * Toma un advisory lock de Postgres para el producto dado, valido solo dentro
 * de la transaccion actual. Serializa operaciones concurrentes sobre las
 * imagenes del mismo producto (evita condiciones de carrera en el conteo de
 * imagenes y en la designacion de imagen primaria).
 */
async function lockProduct(tx: { execute: typeof db.execute }, productId: string) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${productId}))`);
}

/**
 * Retorna todas las imagenes asociadas al producto indicado por ID.
 * @param req - Params: `id` del producto
 * @param res - 200 con array de imagenes, o 500 en error interno
 */
export const getProductImages = async (req: Request, res: Response) => {
    try {
        const data = await db
            .select()
            .from(product_images)
            .where(eq(product_images.product_id, req.params.id as string));
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Sube una imagen para el producto indicado por ID.
 * Rechaza si el producto no existe o si ya alcanzó el limite de {@link MAX_IMAGES} imagenes.
 * La primera imagen subida se marca automaticamente como primaria.
 * En caso de error de BD, el archivo guardado en disco se elimina.
 * @param req - Params: `id` del producto; File: campo `image` (multipart/form-data); Body: `is_primary` (opcional, string `"true"`)
 * @param res - 201 con la imagen creada, 404 si el producto no existe, 400 si se supera el limite, o 500 en error interno
 */
export const uploadProductImage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const productId = req.params.id as string;

        const [product] = await db.select().from(products).where(eq(products.product_id, productId));
        if (!product) {
            if (req.file) await deleteFile(req.file.filename);
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.seller_id !== req.user?.id) {
            if (req.file) await deleteFile(req.file.filename);
            return res.status(403).json({ message: 'Not the owner of this product' });
        }

        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file!.filename}`;

        const newImage = await db.transaction(async (tx) => {
            await lockProduct(tx, productId);

            const [{ count: imageCount }] = await tx
                .select({ count: sql<number>`count(*)::int` })
                .from(product_images)
                .where(eq(product_images.product_id, productId));

            if (imageCount >= MAX_IMAGES) {
                throw new MaxImagesError();
            }

            const isPrimary = req.body.is_primary === 'true' || imageCount === 0;
            if (isPrimary) {
                await tx
                    .update(product_images)
                    .set({ is_primary: false })
                    .where(and(eq(product_images.product_id, productId), eq(product_images.is_primary, true)));
            }

            const [inserted] = await tx
                .insert(product_images)
                .values({ product_id: productId, url, is_primary: isPrimary })
                .returning();
            return inserted;
        });

        return res.status(201).json(newImage);
    } catch (error) {
        if (req.file) await deleteFile(req.file.filename);
        if (error instanceof MaxImagesError) {
            return res.status(400).json({ message: `A product can have at most ${MAX_IMAGES} images` });
        }
        console.error('Error uploading product image:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una imagen del producto por su ID.
 * Borra el registro de la BD y el archivo fisico del disco. Si la imagen eliminada
 * era la primaria y quedan otras, promueve la mas antigua restante a primaria
 * (nunca deja el producto sin ninguna imagen primaria mientras tenga imagenes).
 * @param req - Params: `id` del producto, `imageId` de la imagen
 * @param res - 200 con mensaje de confirmacion, 404 si la imagen no pertenece al producto, o 500 en error interno
 */
export const deleteProductImage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const productId = req.params.id as string;
        const imageId = req.params.imageId as string;

        const [image] = await db
            .select()
            .from(product_images)
            .where(and(eq(product_images.id, imageId), eq(product_images.product_id, productId)));

        if (!image) return res.status(404).json({ message: 'Image not found' });

        const [product] = await db.select({ seller_id: products.seller_id }).from(products).where(eq(products.product_id, productId));
        if (product?.seller_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not the owner of this product' });
        }

        await db.transaction(async (tx) => {
            await lockProduct(tx, productId);
            await tx.delete(product_images).where(eq(product_images.id, imageId));

            if (image.is_primary) {
                const [next] = await tx
                    .select({ id: product_images.id })
                    .from(product_images)
                    .where(eq(product_images.product_id, productId))
                    .orderBy(product_images.created_at)
                    .limit(1);
                if (next) {
                    await tx.update(product_images).set({ is_primary: true }).where(eq(product_images.id, next.id));
                }
            }
        });

        const filename = image.url.split('/uploads/')[1];
        if (filename) await deleteFile(filename);

        return res.status(200).json({ message: 'Image deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Establece una imagen como primaria del producto de forma atomica:
 * resetea `is_primary=false` en las demas y activa solo la indicada, dentro
 * de una misma transaccion para que nunca quede el producto sin primaria.
 * @param req - Params: `id` del producto, `imageId` de la imagen a marcar como primaria
 * @param res - 200 con la imagen actualizada, 404 si no existe, o 500 en error interno
 */
export const setPrimaryImage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const productId = req.params.id as string;
        const imageId = req.params.imageId as string;

        const [image] = await db
            .select()
            .from(product_images)
            .where(and(eq(product_images.id, imageId), eq(product_images.product_id, productId)));

        if (!image) return res.status(404).json({ message: 'Image not found' });

        const [product] = await db.select({ seller_id: products.seller_id }).from(products).where(eq(products.product_id, productId));
        if (product?.seller_id !== req.user?.id) {
            return res.status(403).json({ message: 'Not the owner of this product' });
        }

        const updated = await db.transaction(async (tx) => {
            await lockProduct(tx, productId);

            await tx
                .update(product_images)
                .set({ is_primary: false })
                .where(eq(product_images.product_id, productId));

            const [result] = await tx
                .update(product_images)
                .set({ is_primary: true })
                .where(eq(product_images.id, imageId))
                .returning();
            return result;
        });

        return res.status(200).json(updated);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
