import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";
export const notification_types = pgTable("notification_types", {
  notification_type_id: uuid("notification_type_id").primaryKey().defaultRandom(),
  notification_type_name: text("notification_type_name").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type NotificationType =typeof notification_types.$inferSelect;
  export const insert_notification_type_schema = createInsertSchema(notification_types);
  export const select_notification_type_schema = createSelectSchema(notification_types);