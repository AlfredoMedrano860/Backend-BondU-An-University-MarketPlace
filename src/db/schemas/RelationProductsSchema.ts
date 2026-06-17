import { relations } from "drizzle-orm";

import { products } from "./ProductsSchema";
import { product_categories, products_categories } from "./ProductCategoriesSchema";
import { product_conditions } from "./ProductConditionsSchema";
import { product_status } from "./ProductStatusSchema";
import { product_images } from "./ProductImagesSchema";

/** Relaciones de `products`: una condicion, un estado, muchas categorias via pivot, muchas imagenes */
export const product_relations = relations(products, ({ one, many }) => ({
    categories: many(products_categories),
    images: many(product_images),
    condition: one(product_conditions, {
        fields: [products.condition_id],
        references: [product_conditions.condition_id],
    }),
    status: one(product_status, {
        fields: [products.status_id],
        references: [product_status.status_id],
    }),
}));

/** Relacion de `product_categories`: puede estar en muchos productos via pivot */
export const category_relations = relations(product_categories, ({ many }) => ({
    products: many(products_categories),
}));

/** Relacion de `product_conditions`: puede aplicar a muchos productos */
export const conditions_relations = relations(product_conditions, ({ many }) => ({
    products: many(products),
}));

/** Relacion de `product_status`: puede aplicar a muchos productos */
export const status_relations = relations(product_status, ({ many }) => ({
    products: many(products),
}));

/** Relaciones de la tabla pivot `products_categories` */
export const products_categories_relations = relations(products_categories, ({ one }) => ({
    product: one(products, {
        fields: [products_categories.product_id],
        references: [products.product_id],
    }),
    category: one(product_categories, {
        fields: [products_categories.category_id],
        references: [product_categories.category_id],
    }),
}));

/** Relaciones de `product_images`: cada imagen pertenece a un producto */
export const product_images_relations = relations(product_images, ({ one }) => ({
    product: one(products, {
        fields: [product_images.product_id],
        references: [products.product_id],
    }),
}));
