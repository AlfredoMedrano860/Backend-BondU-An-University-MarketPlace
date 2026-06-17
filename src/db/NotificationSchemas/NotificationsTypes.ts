import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {createInsertSchema,createSelectSchema} from "drizzle-zod";

/** Catalogo de tipos de notificacion disponibles (ej. SYSTEM, PRODUCT, ORDER) */
export const notification_types = pgTable("notification_types", {
  notification_type_id: uuid("notification_type_id").primaryKey().defaultRandom(),
  notification_type_name: text("notification_type_name").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `notification_types` */
export type NotificationType = typeof notification_types.$inferSelect;

/** Schema Zod para insertar un tipo de notificacion */
export const insert_notification_type_schema = createInsertSchema(notification_types);

/** Schema Zod para seleccionar un tipo de notificacion */
export const select_notification_type_schema = createSelectSchema(notification_types);