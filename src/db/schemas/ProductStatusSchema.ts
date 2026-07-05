import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";

/** Catalogo de estados de disponibilidad de un producto (Disponible, Vendido) */
export const product_status = pgTable("product_status", {
  status_id: uuid("status_id").primaryKey().defaultRandom(),
  /** Nombre del estado de disponibilidad. Ej: `"Disponible"`, `"Vendido"` */
  name_status: text("name_status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `product_status` */
export type ProductStatus = typeof product_status.$inferSelect;

/** Schema Zod para insertar un estado de producto */
export const insert_product_status_schema = createInsertSchema(product_status);

/** Schema Zod para seleccionar un estado de producto */
export const select_product_status_schema = createSelectSchema(product_status);
