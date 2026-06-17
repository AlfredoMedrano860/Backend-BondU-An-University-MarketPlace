import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products } from "./ProductsSchema";

/** Catalogo de categorias disponibles para clasificar productos (ej. Electronics, Gaming) */
export const product_categories = pgTable("product_categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom(),
  name_category: text("name_category").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `product_categories` */
export type ProductCategories = typeof product_categories.$inferSelect;

/** Schema Zod para insertar una categoria */
export const insertProductCategoriesSchema = createInsertSchema(product_categories);

/** Schema Zod para seleccionar una categoria */
export const selectProductCategoriesSchema = createSelectSchema(product_categories);

/** Tabla pivot many-to-many entre `products` y `product_categories` */
export const products_categories = pgTable("products_categories", {
  product_id: uuid("product_id").notNull().references(() => products.product_id),
  category_id: uuid("category_id").notNull().references(() => product_categories.category_id),
});