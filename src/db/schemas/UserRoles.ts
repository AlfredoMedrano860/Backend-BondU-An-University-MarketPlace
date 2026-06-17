import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./Users";
import { user_role_types } from "./UserRoleTypes";

/** Tabla de asignacion de roles a usuarios (relacion muchos-a-muchos entre `users` y `user_role_types`) */
export const user_roles = pgTable("user_roles", {
    role_id: uuid("role_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id),
    role_type_id: uuid("role_type_id")
        .notNull()
        .references(() => user_role_types.role_type_id),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

/** Relaciones de `user_roles`: pertenece a un usuario y a un tipo de rol */
export const user_roles_relations = relations(
    user_roles,
    ({ one }) => ({
        user: one(users, {
            fields: [user_roles.user_id],
            references: [users.id],
        }),
        role: one(user_role_types, {
            fields: [user_roles.role_type_id],
            references: [user_role_types.role_type_id],
        }),
    })
);

/** Tipo inferido de la fila completa de `user_roles` */
export type UserRole = typeof user_roles.$inferSelect;

/** Schema Zod para insertar un rol de usuario */
export const insert_user_role_schema = createInsertSchema(user_roles);

/** Schema Zod para seleccionar un rol de usuario */
export const select_user_role_schema = createSelectSchema(user_roles);