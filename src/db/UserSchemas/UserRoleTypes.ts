import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const user_role_types = pgTable("user_role_types", {
    role_type_id: uuid("role_type_id").primaryKey().defaultRandom(),
    role_name: text("role_name").notNull(),

    created_at: timestamp("created_at").defaultNow().notNull(),
});

export type UserRoleType = typeof user_role_types.$inferSelect;

export const insert_user_role_type_schema = createInsertSchema(user_role_types);
export const select_user_role_type_schema = createSelectSchema(user_role_types);