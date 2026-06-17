import { pgTable, uuid } from "drizzle-orm/pg-core";

import { products } from "./ProductSchemas";
import { product_conditions } from "./ProductConditions";

/** Tabla intermedia que relaciona productos con sus condiciones (muchos-a-muchos) */
export const product_conditions_relation = pgTable(
  "product_conditions_relation",
  {
    product_id: uuid("product_id").notNull().references(() => products.product_id),
    conditions_id: uuid("conditions_id").notNull().references(() => product_conditions.condition_id),
  }
);