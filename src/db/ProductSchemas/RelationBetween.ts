import { relations } from "drizzle-orm";

import { products } from "../ProductSchemas/ProductSchemas";
import { product_categories } from "../ProductSchemas/ProductCategories";
import { product_conditions } from "../ProductSchemas/ProductConditions";
import { product_status } from "../ProductSchemas/ProductStatus";

import { product_category_relation } from "../ProductSchemas/RelationCategory";
import { product_conditions_relation } from "../ProductSchemas/RelationCondition";
import { product_status_relation } from "../ProductSchemas/RelationStatus";

export const product_relations = relations(
  products,
  ({ many }) => ({
    categories: many(product_category_relation),
    conditions: many(product_conditions_relation),
    status: many(product_status_relation),
  })
);

export const category_relations = relations(
  product_categories,
  ({ many }) => ({
    products: many(product_category_relation),
  })
);

export const conditions_relations = relations(
  product_conditions,
  ({ many }) => ({
    products: many(product_conditions_relation),
  })
);

export const status_relations = relations(
  product_status,
  ({ many }) => ({
    products: many(product_status_relation),
  })
);

export const product_category_relation_middle =
  relations(product_category_relation, ({ one }) => ({
    product: one(products, {
      fields: [product_category_relation.product_id],
      references: [products.product_id],
    }),

    category: one(product_categories, {
      fields: [product_category_relation.category_id],
      references: [product_categories.category_id],
    }),
  }));

  export const product_conditions_relation_middle =
  relations(product_conditions_relation, ({ one }) => ({
    product: one(products, {
      fields: [product_conditions_relation.product_id],
      references: [products.product_id],
    }),

    conditions: one(product_conditions, {
      fields: [product_conditions_relation.conditions_id],
      references: [product_conditions.condition_id],
    }),
  }));

  export const product_status_relation_middle =
  relations(product_status_relation, ({ one }) => ({
    product: one(products, {
      fields: [product_status_relation.product_id],
      references: [products.product_id],
    }),

    status: one(product_status, {
      fields: [product_status_relation.status_id],
      references: [product_status.status_id],
    }),
  }));