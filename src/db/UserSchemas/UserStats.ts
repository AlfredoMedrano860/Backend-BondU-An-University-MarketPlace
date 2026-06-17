import { pgTable, uuid, timestamp, integer, numeric } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./Users";

/** Estadisticas de actividad del usuario: calificacion promedio, ventas y resenas */
export const user_stats = pgTable("user_stats", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    rating_avg: numeric("rating_avg"),
    review_count: integer("review_count").default(0),
    sales_count: integer("sales_count").default(0),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Relacion de `user_stats`: pertenece a un usuario */
export const user_stats_relations = relations(
    user_stats,
    ({ one }) => ({
        user: one(users, {
            fields: [user_stats.user_id],
            references: [users.id],
        }),
    })
);

/** Tipo inferido de la fila completa de `user_stats` */
export type UserStats = typeof user_stats.$inferSelect;

/** Schema Zod para insertar estadisticas de usuario */
export const insert_user_stats_schema = createInsertSchema(user_stats);

/** Schema Zod para seleccionar estadisticas de usuario */
export const select_user_stats_schema = createSelectSchema(user_stats);