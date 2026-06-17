import {pgTable,uuid,timestamp,boolean} from "drizzle-orm/pg-core";

import {createInsertSchema,createSelectSchema,} from "drizzle-zod";

import { notification_types } from "./NotificationsTypes";

export const notifications = pgTable("notifications", {
  notification_id: uuid("notification_id").primaryKey().defaultRandom(),
  notification_type_id: uuid("notification_type_id").notNull().references(() => notification_types.notification_type_id),
  is_read: boolean("is_read").default(false).notNull(),
  read_at: timestamp("read_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

export const insert_notification_schema = createInsertSchema(notifications);

export const select_notification_schema = createSelectSchema(notifications);