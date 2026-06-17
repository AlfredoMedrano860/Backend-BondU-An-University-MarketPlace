import { relations } from "drizzle-orm";

import { notification_types } from "./NotificationsTypes";
import { notifications } from "./NotificatioSchemas";

export const notification_type_relations = relations(
  notification_types,
  ({ many }) => ({
    notifications: many(notifications),
  }),
);

export const notification_relations = relations(
  notifications,
  ({ one }) => ({
    notification_type: one(notification_types, {
      fields: [notifications.notification_type_id],
      references: [
        notification_types.notification_type_id,
      ],
    }),
  }),
);