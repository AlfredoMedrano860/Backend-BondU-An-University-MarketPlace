import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/** Catalogo de tipos de rol disponibles en la plataforma (ej. seller, buyer, admin) */
export const user_role_types = pgTable("user_role_types", {
    role_type_id: uuid("role_type_id").primaryKey().defaultRandom(),
    role_name: text("role_name").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `user_role_types` */
export type UserRoleType = typeof user_role_types.$inferSelect;

/** Schema Zod para insertar un tipo de rol */
export const insert_user_role_type_schema = createInsertSchema(user_role_types);

/** Schema Zod para seleccionar un tipo de rol */
export const select_user_role_type_schema = createSelectSchema(user_role_types);