import { db } from "../connection";
import { notifications } from "../schemas/NotificationsSchema";
import { notification_types } from "../schemas/NotificationTypesSchema";

/**
 * Puebla la base de datos con tipos de notificacion y notificaciones de prueba.
 * Bloqueado en produccion mediante la variable de entorno `APP_STAGE`.
 */
const seed = async () => {
  const appStage = process.env.APP_STAGE;

  if (appStage === "production") {
    console.error("ERROR: Cannot run seed script in production environment!");
    process.exit(1);
  }

  console.log(`Running seed in ${appStage} environment...`);
  console.log("Starting notifications seed...");

  try {
    console.log("Deleting existing data...");
    await db.delete(notifications).execute();
    await db.delete(notification_types).execute();

    console.log("Inserting seed data...");

    // Coinciden con los 4 tipos de notificacion definidos en el frontend
    // (`NotificationType` en `src/components/data/NotificationStore.ts`)
    const insertedTypes = await db.insert(notification_types)
      .values([
        { notification_type_name: "success" },
        { notification_type_name: "error" },
        { notification_type_name: "warning" },
        { notification_type_name: "info" },
      ])
      .returning();

    await db.insert(notifications).values([
      { notification_type_id: insertedTypes[0].notification_type_id, is_read: false },
      { notification_type_id: insertedTypes[1].notification_type_id, is_read: true, read_at: new Date() },
      { notification_type_id: insertedTypes[2].notification_type_id, is_read: false },
      { notification_type_id: insertedTypes[3].notification_type_id, is_read: false },
    ]);

    console.log("Notifications seed completed successfully!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seed;
