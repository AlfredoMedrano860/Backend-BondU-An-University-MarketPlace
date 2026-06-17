import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";

/** Catalogo de condiciones fisicas de los productos (ej. New, Used) */
export const product_conditions = pgTable("product_conditions", {
  condition_id: uuid("condition_id").primaryKey().defaultRandom(),
  name_condition: text("name_condition").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `product_conditions` */
export type ProductConditions = typeof product_conditions.$inferSelect;

/** Schema Zod para insertar una condicion */
export const insertProductConditionsSchema = createInsertSchema(product_conditions);

/** Schema Zod para seleccionar una condicion */
export const selectProductConditionsSchema = createSelectSchema(product_conditions);