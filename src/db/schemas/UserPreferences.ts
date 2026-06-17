import { pgTable, uuid, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./Users";

/** Preferencias de configuracion por usuario (idioma, notificaciones, etc.) */
export const user_preferences = pgTable("user_preferences", {
    preference_id: uuid("preference_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    notifications: boolean("notifications").default(true),
    language: text("language").default("es"),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Relacion de `user_preferences`: pertenece a un usuario */
export const user_preferences_relations = relations(
    user_preferences,
    ({ one }) => ({
        user: one(users, {
            fields: [user_preferences.user_id],
            references: [users.id],
        }),
    })
);

/** Tipo inferido de la fila completa de `user_preferences` */
export type UserPreferences = typeof user_preferences.$inferSelect;

/** Schema Zod para insertar preferencias de usuario */
export const insert_user_preferences_schema = createInsertSchema(user_preferences);

/** Schema Zod para seleccionar preferencias de usuario */
export const select_user_preferences_schema = createSelectSchema(user_preferences);