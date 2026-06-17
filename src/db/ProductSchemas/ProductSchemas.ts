import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";

export const products = pgTable("products", {
  product_id: uuid("product_id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export const insert_product_schema =  createInsertSchema(products);

export const select_product_schema =createSelectSchema(products);