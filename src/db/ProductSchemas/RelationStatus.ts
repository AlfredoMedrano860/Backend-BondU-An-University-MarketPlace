import { pgTable, uuid } from "drizzle-orm/pg-core";

import { products } from "./ProductSchemas";
import { product_status } from "./ProductStatus";

export const product_status_relation = pgTable(
  "product_status_relation",
  {
    product_id: uuid("product_id").notNull().references(() => products.product_id),
    status_id: uuid("status_id").notNull().references(() => product_status.status_id),
  }
);