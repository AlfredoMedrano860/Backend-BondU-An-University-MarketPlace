import { pgTable, uuid, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./UsersSchema";

/** Preferencias de configuracion por usuario (idioma, notificaciones, etc.) */
export const user_preferences = pgTable("user_preferences", {
    preference_id: uuid("preference_id").primaryKey().defaultRandom(),
    /** FK hacia `users`. Un usuario puede tener multiples registros de preferencias */
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    /** Habilita o deshabilita el envio de notificaciones al usuario. Default `true` */
    notifications: boolean("notifications").default(true),
    /** Idioma preferido de la interfaz. Default `"es"` (espanol) */
    language: text("language").default("es"),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `user_preferences` */
export type UserPreferences = typeof user_preferences.$inferSelect;

/** Schema Zod para insertar preferencias de usuario */
export const insert_user_preferences_schema = createInsertSchema(user_preferences);

/** Schema Zod para seleccionar preferencias de usuario */
export const select_user_preferences_schema = createSelectSchema(user_preferences);
