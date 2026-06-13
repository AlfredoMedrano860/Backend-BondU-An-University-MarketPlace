import { pgTable, uuid, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./Users";

export const user_preferences = pgTable("user_preferences",{
    preference_id: uuid("preference_id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id),

    notifications: boolean("notifications").default(true),
    language: text("language").default("es"),

    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const user_preferences_relations = relations(
    user_preferences,
    ({ one }) => ({
        user: one(users,{
            fields:[user_preferences.user_id],
            references:[users.id],
        }),
    })
);

export type UserPreferences = typeof user_preferences.$inferSelect;

export const insert_user_preferences_schema = createInsertSchema(user_preferences);
export const select_user_preferences_schema = createSelectSchema(user_preferences);