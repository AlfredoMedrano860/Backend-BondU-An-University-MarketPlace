import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/** Tabla principal de usuarios de la plataforma BondU */
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").notNull(),
    /** Debe ser unico. Se usa como credencial de login */
    email: text("email").notNull().unique(),
    /** Almacenada con hash bcrypt, nunca en texto plano */
    password: text("password").notNull(),
    /** URL del avatar del usuario. Nullable si no ha subido foto */
    avatar: text("avatar"),
    /** Numero de telefono de contacto. Nullable */
    phone: text("phone"),
    /** Ciudad o region del usuario. Nullable */
    location: text("location"),
    /** Universidad a la que pertenece el usuario. Nullable */
    university: text("university"),
    /** Carrera o programa academico. Nullable */
    career: text("career"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `users` */
export type User = typeof users.$inferSelect;

/** Schema Zod para seleccionar un usuario */
export const select_user_schema = createSelectSchema(users);

/**
 * Schema Zod para actualizar un usuario desde `PUT /users/:id`.
 * Excluye `id`, `password` y las marcas de tiempo: la contraseña solo se cambia
 * mediante `PATCH /users/:id/password` (verifica la actual y la hashea).
 */
export const update_user_schema = createInsertSchema(users)
    .omit({ id: true, password: true, created_at: true, updated_at: true })
    .partial();
