import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./Users";
import { user_role_types } from "./UserRoleTypes";

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

export type UserRole = typeof user_roles.$inferSelect;

export const insert_user_role_schema = createInsertSchema(user_roles);
export const select_user_role_schema = createSelectSchema(user_roles);