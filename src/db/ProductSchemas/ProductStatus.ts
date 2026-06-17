import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";
export const product_status = pgTable("product_status", {
  status_id: uuid("status_id").primaryKey().defaultRandom(),
  name_status: text("name_status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductStatus = typeof product_status.$inferSelect;

export const insert_product_status_schema = createInsertSchema(product_status);

export const select_product_status_schema = createSelectSchema(product_status);