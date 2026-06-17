import { db } from "../connection";
import { notifications } from "../schemas/NotificatioSchemas";
import { notification_types } from "../schemas/NotificationsTypes";

/**
 * Puebla la base de datos con tipos de notificacion y notificaciones de prueba.
 * Bloqueado en produccion mediante la variable de entorno `APP_STAGE`.
 */
const seed = async () => {
  const appStage = process.env.APP_STAGE;

  if (appStage === "production") {
    console.error(
      "ERROR: Cannot run seed script in production environment!"
    );
    process.exit(1);
  }

  console.log(`Running seed in ${appStage} environment...`);
  console.log("Starting notifications seed...");

  try {

    console.log("Deleting existing data...");

    await db.delete(notifications).execute();
    await db.delete(notification_types).execute();

    console.log("Inserting seed data...");

    const insertedTypes =
      await db.insert(notification_types)
        .values([
          {
            notification_type_name:
              "SYSTEM",
          },
          {
            notification_type_name:
              "PRODUCT",
          },
          {
            notification_type_name:
              "ORDER",
          },
        ])
        .returning();

    await db.insert(notifications)
      .values([
        {
          notification_type_id:
            insertedTypes[0]
              .notification_type_id,

          is_read: false,
        },

        {
          notification_type_id:
            insertedTypes[1]
              .notification_type_id,

          is_read: true,
          read_at: new Date(),
        },

        {
          notification_type_id:
            insertedTypes[2]
              .notification_type_id,

          is_read: false,
        },
      ]);

    console.log(
      "Notifications seed completed successfully!"
    );

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