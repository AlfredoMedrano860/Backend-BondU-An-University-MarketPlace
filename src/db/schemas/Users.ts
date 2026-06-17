import { pgTable, uuid, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user_stats } from "./UserStats";
import { user_preferences } from "./UserPreferences";
import { user_roles } from "./UserRoles";

/** Tabla principal de usuarios de la plataforma BondU */
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    avatar: text("avatar"),
    phone: text("phone"),
    location: text("location"),
    university: text("university"),
    career: text("career"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Relaciones del usuario: tiene muchas estadisticas, preferencias y roles */
export const user_relations = relations(
    users,
    ({ many }) => ({
        stats: many(user_stats),
        preferences: many(user_preferences),
        roles: many(user_roles),
    })
);

/** Tipo inferido de la fila completa de `users` */
export type User = typeof users.$inferSelect;

/** Schema Zod para insertar un usuario (todos los campos requeridos) */
export const insert_user_schema = createInsertSchema(users);

/** Schema Zod para seleccionar un usuario */
export const select_user_schema = createSelectSchema(users);

/** Schema Zod para actualizar un usuario (todos los campos opcionales) */
export const update_user_schema = createInsertSchema(users).partial();