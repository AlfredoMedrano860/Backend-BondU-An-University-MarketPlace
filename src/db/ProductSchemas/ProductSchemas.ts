import {pgTable,uuid,text,timestamp,integer} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// import { primaryKey } from "drizzle-orm/gel-core";

//tablas de los productos y todos lo que estén relacionados
export const products = pgTable("products", {
  product_id: uuid("product_id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
export const product_categories = pgTable("product_categories",{
    category_id: uuid("category_id").primaryKey().defaultRandom(),
    name_category: text("name_category").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const product_conditions = pgTable("product_conditions",{
    condition_id: uuid("category_id").primaryKey().defaultRandom(),
    name_condition: text("name_category").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const product_status = pgTable("product_status",{
    status_id: uuid("status_id").primaryKey().defaultRandom(),
    name_status: text("name_status").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});


//relaciones entre ellos donde estas se introducen en una tabla ya que la relacion es N:M
//Esto requiere que para evitar una dependencia circular, se hace una tabla que es en si la relación entre ambas

export const product_category_relation = pgTable("product_category_relation",{
    product_id: uuid("product_id").notNull().references(
        () => products.product_id),

    category_id: uuid("category_id").notNull().references(
        () => product_categories.category_id),
  });

  export const product_conditions_relation = pgTable("product_conditions_relation",{
    product_id: uuid("product_id").notNull().references(
        () => products.product_id),

    conditions_id: uuid("conditions_id").notNull().references(
        () => product_conditions.condition_id,)
  });
   export const product_status_relation = pgTable("product_status_relation",{
    product_id: uuid("product_id").notNull().references(
        () => products.product_id),

    status_id: uuid("status_id").notNull().references(
        () => product_status.status_id),
  });

  //estas son las relaciones más directas que se tienen que hacer para que se puedan hacer las consultas de manera más sencilla
  // ya que si no se hicieran estas relaciones, se tendrían que hacer consultas más complejas para obtener los datos relacionados

export const product_relations = relations(
  products,
  ({ many }) => ({
    categories: many(product_category_relation),
    product_conditions: many(product_conditions_relation),
    product_status: many(product_status_relation),
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



export const product_category_relation2 = relations(
    product_category_relation,
    ({ one }) => ({
      product: one(products, {
        fields: [product_category_relation.product_id],
        references: [products.product_id],
      }),

      category: one(product_categories, {
        fields: [product_category_relation.category_id],
        references: [product_categories.category_id],
      }),
    })
  );

  export const product_conditions_relation2 = relations(
    product_conditions_relation,
    ({ one }) => ({
      product: one(products, {
        fields: [product_conditions_relation.product_id],
        references: [products.product_id],
      }),

      conditions: one(product_conditions, {
        fields: [product_conditions_relation.conditions_id],
        references: [product_conditions.condition_id],
      }),
    })
  );

  export const product_status_relation2 = relations(
    product_status_relation,
    ({ one }) => ({
      product: one(products, {
        fields: [product_status_relation.product_id],
        references: [products.product_id],
      }),

      category: one(product_status, {
        fields: [product_status_relation.status_id],
        references: [product_status.status_id],
      }),
    })
  );

  export type Product = typeof products.$inferSelect;
  export type ProductCategories = typeof product_categories.$inferSelect;
  export type ProductConditions = typeof product_conditions.$inferSelect;
  export type ProductStatus = typeof product_status.$inferSelect;


export const insert_product_schema = createInsertSchema(products);
export const select_product_schema = createSelectSchema(products);

export const insert_category_schema = createInsertSchema(product_categories);
export const select_category_schema = createSelectSchema(product_categories);

export const insert_status_schema = createInsertSchema(product_status);
export const select_status_schema = createSelectSchema(product_status);

export const insert_conditions_schema = createInsertSchema(product_conditions);
export const select_conditions_schema = createSelectSchema(product_conditions);