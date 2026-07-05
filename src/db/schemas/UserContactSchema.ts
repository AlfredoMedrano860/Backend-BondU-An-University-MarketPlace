import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./UsersSchema";

export const user_contact = pgTable("user_contact", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    instagram: text("instagram"),
    telegram: text("telegram"),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type UserContact = typeof user_contact.$inferSelect;

export const insert_user_contact_schema = createInsertSchema(user_contact);
export const update_user_contact_schema = createInsertSchema(user_contact).partial();
