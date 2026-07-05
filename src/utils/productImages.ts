import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { product_images } from '../db/schemas/ProductImagesSchema';
import { deleteFile } from './fileHelper';

/**
 * Borra del disco los archivos de todas las imagenes de un producto (no toca las filas en la BD).
 * Usado antes de borrar un producto o un usuario, para no dejar archivos huerfanos en `uploads/`.
 * @param productId - ID del producto cuyas imagenes se borran del disco.
 */
export async function deleteProductImageFiles(productId: string) {
    const images = await db
        .select({ url: product_images.url })
        .from(product_images)
        .where(eq(product_images.product_id, productId));

    await Promise.all(
        images.map(({ url }) => {
            const filename = url.split('/uploads/')[1];
            return filename ? deleteFile(filename) : Promise.resolve(false);
        })
    );
}
