import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";
export const product_categories = pgTable("product_categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom(),

  name_category: text("name_category").notNull(),

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductCategories = typeof product_categories.$inferSelect;

export const insertProductCategoriesSchema = createInsertSchema(product_categories);

export const selectProductCategoriesSchema = createSelectSchema(product_categories);