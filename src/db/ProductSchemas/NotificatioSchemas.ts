import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const notification_types = pgTable("notification_types", {
  notification_type_id: uuid("notification_type_id")
    .primaryKey()
    .defaultRandom(),

  notification_type_name: text("notification_type_name").notNull(),

  created_at: timestamp("created_at").defaultNow().notNull(),

  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  notification_id: uuid("notification_id").primaryKey().defaultRandom(),

  notification_type_id: uuid("notification_type_id")
    .notNull()
    .references(() => notification_types.notification_type_id),

  is_read: boolean("is_read").default(false).notNull(),

  read_at: timestamp("read_at"),

  created_at: timestamp("created_at").defaultNow().notNull(),

  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const notification_type_relations = relations(
  notification_types,
  ({ many }) => ({
    notifications: many(notifications),
  }),
);

export const notification_relations = relations(notifications, ({ one }) => ({
  notification_type: one(notification_types, {
    fields: [notifications.notification_type_id],
    references: [notification_types.notification_type_id],
  }),
}));

export type NotificationType = typeof notification_types.$inferSelect;

export type Notification = typeof notifications.$inferSelect;

export const insert_notification_type_schema =
  createInsertSchema(notification_types);

export const select_notification_type_schema =
  createSelectSchema(notification_types);

export const insert_notification_schema = createInsertSchema(notifications);

export const select_notification_schema = createSelectSchema(notifications);
