import { pgTable, uuid, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { products } from "./ProductsSchema";

/** Imagenes asociadas a un producto. Maximo 4 por producto, solo una puede ser primaria */
export const product_images = pgTable("product_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    product_id: uuid("product_id").notNull().references(() => products.product_id),
    url: text("url").notNull(),
    is_primary: boolean("is_primary").notNull().default(false),
    created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    uniqueIndex("one_primary_per_product").on(table.product_id).where(sql`${table.is_primary} = true`),
]);

/** Tipo inferido de la fila completa de `product_images` */
export type ProductImage = typeof product_images.$inferSelect;

/** Schema Zod para insertar una imagen de producto */
export const insert_product_image_schema = createInsertSchema(product_images);

/** Schema Zod para seleccionar una imagen de producto */
export const select_product_image_schema = createSelectSchema(product_images);
