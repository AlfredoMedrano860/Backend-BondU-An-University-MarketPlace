import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";
export const product_conditions = pgTable("product_conditions", {
  condition_id: uuid("condition_id").primaryKey().defaultRandom(),
  name_condition: text("name_condition").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductConditions = typeof product_conditions.$inferSelect;

export const insertProductConditionsSchema = createInsertSchema(product_conditions);

export const selectProductConditionsSchema = createSelectSchema(product_conditions);