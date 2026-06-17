import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { notifications } from "../db/schemas/NotificatioSchemas";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para el CRUD de notificaciones. Montado en `/api/notifications` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const notificationIdSchema = z.object({
  id: z.string().uuid(),
});

/** Valida el body para crear una notificacion */
const createNotificationSchema = z.object({
  notification_type_id: z.string().uuid(),
  is_read: z.boolean().optional(),
  read_at: z.iso.datetime().optional(),
});

/** Valida el body para actualizar una notificacion (todos los campos opcionales) */
const updateNotificationSchema = z.object({
  is_read: z.boolean().optional(),
  read_at: z.iso.datetime().optional(),
});

/**
 * Obtiene la lista de todas las notificaciones.
 * @route GET /api/notifications
 * @returns Lista de notificaciones o error 500
 */
router.get("/", async (_, res) => {
  try {
    const data = await db.select().from(notifications);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Obtiene una notificacion por su ID.
 * @route GET /api/notifications/:id
 * @param id - UUID de la notificacion
 * @returns La notificacion encontrada, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(notificationIdSchema), async (req, res) => {
  try {
    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.notification_id, req.params.id as string));

    if (!data.length) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Crea una nueva notificacion.
 * @route POST /api/notifications
 * @param body - `notification_type_id`, y opcionalmente `is_read` y `read_at`
 * @returns La notificacion creada con status 201, o 500 en error
 */
router.post("/", validateBody(createNotificationSchema), async (req, res) => {
  try {
    const data = await db
      .insert(notifications)
      .values(req.body)
      .returning();

    return res.status(201).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Actualiza el estado de lectura de una notificacion.
 * @route PUT /api/notifications/:id
 * @param id - UUID de la notificacion a actualizar
 * @param body - `is_read` y/o `read_at`
 * @returns La notificacion actualizada, 404 si no existe, o 500 en error
 */
router.put("/:id", validateParams(notificationIdSchema), validateBody(updateNotificationSchema), async (req, res) => {
    try {
      const data = await db
        .update(notifications)
        .set(req.body)
        .where(eq(notifications.notification_id, req.params.id as string))
        .returning();

      if (!data.length) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.status(200).json(data[0]);
    } catch {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Elimina una notificacion por su ID.
 * @route DELETE /api/notifications/:id
 * @param id - UUID de la notificacion a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(notificationIdSchema), async (req, res) => {
  try {
    const data = await db
      .delete(notifications)
      .where(eq(notifications.notification_id, req.params.id as string))
      .returning();

    if (!data.length) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
