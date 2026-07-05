import { relations } from "drizzle-orm";

import { products } from "./ProductsSchema";
import { product_conditions } from "./ProductConditionsSchema";
import { product_status } from "./ProductStatusSchema";
import { product_images } from "./ProductImagesSchema";
import { users } from "./UsersSchema";

/** Relaciones de `products`: un vendedor, una condicion, un estado, muchas imagenes */
export const product_relations = relations(products, ({ one, many }) => ({
    seller: one(users, {
        fields: [products.seller_id],
        references: [users.id],
    }),
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

/** Relacion de `product_conditions`: puede aplicar a muchos productos */
export const conditions_relations = relations(product_conditions, ({ many }) => ({
    products: many(products),
}));

/** Relacion de `product_status`: puede aplicar a muchos productos */
export const status_relations = relations(product_status, ({ many }) => ({
    products: many(products),
}));

/** Relaciones de `product_images`: cada imagen pertenece a un producto */
export const product_images_relations = relations(product_images, ({ one }) => ({
    product: one(products, {
        fields: [product_images.product_id],
        references: [products.product_id],
    }),
}));
