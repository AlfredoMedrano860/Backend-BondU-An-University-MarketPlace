import type { Request, Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { product_images } from '../db/schemas/ProductImagesSchema';
import { products } from '../db/schemas/ProductsSchema';
import { deleteFile } from '../utils/fileHelper';

const MAX_IMAGES = 4;

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
export const uploadProductImage = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id as string;

        const [product] = await db.select().from(products).where(eq(products.product_id, productId));
        if (!product) {
            if (req.file) await deleteFile(req.file.filename);
            return res.status(404).json({ message: 'Product not found' });
        }

        const [{ count: imageCount }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(product_images)
            .where(eq(product_images.product_id, productId));

        if (imageCount >= MAX_IMAGES) {
            if (req.file) await deleteFile(req.file.filename);
            return res.status(400).json({ message: `A product can have at most ${MAX_IMAGES} images` });
        }

        const isPrimary = req.body.is_primary === 'true' || imageCount === 0;
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file!.filename}`;

        const [newImage] = await db
            .insert(product_images)
            .values({ product_id: productId, url, is_primary: isPrimary })
            .returning();

        return res.status(201).json(newImage);
    } catch (error) {
        if (req.file) await deleteFile(req.file.filename);
        console.error('Error uploading product image:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Elimina una imagen del producto por su ID.
 * Borra el registro de la BD y el archivo fisico del disco.
 * @param req - Params: `id` del producto, `imageId` de la imagen
 * @param res - 200 con mensaje de confirmacion, 404 si la imagen no pertenece al producto, o 500 en error interno
 */
export const deleteProductImage = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id as string;
        const imageId = req.params.imageId as string;

        const [image] = await db
            .select()
            .from(product_images)
            .where(and(eq(product_images.id, imageId), eq(product_images.product_id, productId)));

        if (!image) return res.status(404).json({ message: 'Image not found' });

        await db.delete(product_images).where(eq(product_images.id, imageId));

        const filename = image.url.split('/uploads/')[1];
        if (filename) await deleteFile(filename);

        return res.status(200).json({ message: 'Image deleted' });
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Establece una imagen como primaria del producto.
 * Primero resetea `is_primary=false` en todas las imagenes del producto,
 * luego activa solo la imagen indicada.
 * @param req - Params: `id` del producto, `imageId` de la imagen a marcar como primaria
 * @param res - 200 con la imagen actualizada, 404 si no existe, o 500 en error interno
 */
export const setPrimaryImage = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id as string;
        const imageId = req.params.imageId as string;

        const [image] = await db
            .select()
            .from(product_images)
            .where(and(eq(product_images.id, imageId), eq(product_images.product_id, productId)));

        if (!image) return res.status(404).json({ message: 'Image not found' });

        await db
            .update(product_images)
            .set({ is_primary: false })
            .where(eq(product_images.product_id, productId));

        const [updated] = await db
            .update(product_images)
            .set({ is_primary: true })
            .where(eq(product_images.id, imageId))
            .returning();

        return res.status(200).json(updated);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
