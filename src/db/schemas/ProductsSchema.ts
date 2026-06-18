import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { product_conditions } from "./ProductConditionsSchema";
import { product_status } from "./ProductStatusSchema";

/** Tabla principal de productos publicados en el marketplace */
export const products = pgTable("products", {
  product_id: uuid("product_id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  /** Precio en la moneda local (entero, sin decimales). Ej: 15000 = $15.000 CLP */
  price: integer("price").notNull(),
  /** FK hacia `product_conditions`. Nullable si aun no se asigna condicion */
  condition_id: uuid("condition_id").references(() => product_conditions.condition_id),
  /** FK hacia `product_status`. Nullable si aun no se asigna estado */
  status_id: uuid("status_id").references(() => product_status.status_id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `products` */
export type Product = typeof products.$inferSelect;

/** Schema Zod para insertar un producto */
export const insert_product_schema = createInsertSchema(products);

/** Schema Zod para seleccionar un producto */
export const select_product_schema = createSelectSchema(products);
