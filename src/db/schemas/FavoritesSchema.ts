import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

import { users } from "./UsersSchema";
import { products } from "./ProductsSchema";

/** Tabla pivot: productos marcados como favoritos por un usuario */
export const user_favorites = pgTable("user_favorites", {
    /** FK hacia `users` */
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    /** FK hacia `products` */
    product_id: uuid("product_id").notNull().references(() => products.product_id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({ columns: [t.user_id, t.product_id] }),
]);

export type UserFavorite = typeof user_favorites.$inferSelect;

export const insert_user_favorite_schema = createInsertSchema(user_favorites);
export const select_user_favorite_schema = createSelectSchema(user_favorites);

/** Relaciones de favoritos */
export const user_favorites_relations = relations(user_favorites, ({ one }) => ({
    user: one(users, {
        fields: [user_favorites.user_id],
        references: [users.id],
    }),
    product: one(products, {
        fields: [user_favorites.product_id],
        references: [products.product_id],
    }),
}));
