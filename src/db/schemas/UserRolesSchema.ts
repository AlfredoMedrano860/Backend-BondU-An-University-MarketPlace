import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./UsersSchema";
import { user_role_types } from "./UserRoleTypesSchema";

/** Tabla de asignacion de roles a usuarios (relacion muchos-a-muchos entre `users` y `user_role_types`) */
export const user_roles = pgTable("user_roles", {
    role_id: uuid("role_id").primaryKey().defaultRandom(),
    /** FK hacia `users`. Usuario al que se le asigna el rol. Se borra en cascada con la cuenta */
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    /** FK hacia `user_role_types`. Define que tipo de rol tiene el usuario */
    role_type_id: uuid("role_type_id")
        .notNull()
        .references(() => user_role_types.role_type_id),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `user_roles` */
export type UserRole = typeof user_roles.$inferSelect;

/** Schema Zod para insertar un rol de usuario */
export const insert_user_role_schema = createInsertSchema(user_roles);

/** Schema Zod para seleccionar un rol de usuario */
export const select_user_role_schema = createSelectSchema(user_roles);
