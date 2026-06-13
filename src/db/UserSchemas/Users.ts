import { pgTable, uuid, text, timestamp, boolean, integer, numeric} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user_stats } from "./UserStats";
import { user_preferences } from "./UserPreferences";
import { user_roles } from "./UserRoles";

export const users = pgTable("users", {
    id: uuid("id")
        .primaryKey()
        .defaultRandom(),
    username: text("username")
        .notNull(),
    email: text("email")
        .notNull(),
    password: text("password")
        .notNull(),
    avatar: text("avatar"),
    phone: text("phone"),
    location: text("location"),
    university: text("university"),
    career: text("career"),
    created_at: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updated_at: timestamp("updated_at")
        .defaultNow()
        .notNull(),
});

export const user_relations = relations(
    users,
    ({ many }) => ({
        stats: many(user_stats),
        preferences: many(user_preferences),
        roles: many(user_roles),
    })
);

export type User = typeof users.$inferSelect;
export const insert_user_schema = createInsertSchema(users);
export const select_user_schema = createSelectSchema(users);
export const update_user_schema = createInsertSchema(users).partial();