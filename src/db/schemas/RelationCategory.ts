import { pgTable, uuid } from "drizzle-orm/pg-core";

import { products } from "./ProductSchemas";
import { product_categories } from "./ProductCategories";

/** Tabla intermedia que relaciona productos con sus categorias (muchos-a-muchos) */
export const product_category_relation = pgTable(
  "product_category_relation",
  {
    product_id: uuid("product_id").notNull().references(() => products.product_id),
    category_id: uuid("category_id").notNull().references(() => product_categories.category_id),
  }
);