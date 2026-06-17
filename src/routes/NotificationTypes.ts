import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { notification_types } from "../db/schemas/NotificationsTypes";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para el CRUD de tipos de notificacion. Montado en `/api/notification-types` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const getNotificationTypesByIdSchema = z.object({
  id: z.uuid(),
});

/** Valida el body para crear un tipo de notificacion */
const createNotificationTypeSchema = z.object({
  notification_type_name: z.string().min(1),
});

/** Valida el body para actualizar un tipo de notificacion (todos los campos opcionales) */
const updateNotificationTypeSchema = z.object({
  notification_type_name: z.string().min(1).optional(),
});

/**
 * Obtiene la lista de todos los tipos de notificacion.
 * @route GET /api/notification-types
 * @returns Lista de tipos de notificacion o error 500
 */
router.get("/", async (_, res) => {
  try {
    const data = await db.select().from(notification_types);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Obtiene un tipo de notificacion por su ID.
 * @route GET /api/notification-types/:id
 * @param id - UUID del tipo de notificacion
 * @returns El tipo encontrado, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(getNotificationTypesByIdSchema), async (req, res) => {
  try {
    const data = await db
      .select()
      .from(notification_types)
      .where(eq(notification_types.notification_type_id, req.params.id as string));

    if (!data.length) {
      return res.status(404).json({ message: "Notification type not found" });
    }

    return res.status(200).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Crea un nuevo tipo de notificacion.
 * @route POST /api/notification-types
 * @param body - `notification_type_name`
 * @returns El tipo creado con status 201, o 500 en error
 */
router.post("/", validateBody(createNotificationTypeSchema), async (req, res) => {
  try {
    const data = await db
      .insert(notification_types)
      .values(req.body)
      .returning();

    return res.status(201).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Actualiza un tipo de notificacion existente.
 * @route PUT /api/notification-types/:id
 * @param id - UUID del tipo a actualizar
 * @param body - `notification_type_name` a actualizar
 * @returns El tipo actualizado, 404 si no existe, o 500 en error
 */
router.put("/:id", validateParams(getNotificationTypesByIdSchema), validateBody(updateNotificationTypeSchema), async (req, res) => {
    try {
      const data = await db
        .update(notification_types)
        .set(req.body)
        .where(eq(notification_types.notification_type_id, req.params.id as string))
        .returning();

      if (!data.length) {
        return res.status(404).json({ message: "Notification type not found" });
      }

      return res.status(200).json(data[0]);
    } catch {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Elimina un tipo de notificacion por su ID.
 * @route DELETE /api/notification-types/:id
 * @param id - UUID del tipo a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(getNotificationTypesByIdSchema), async (req, res) => {
  try {
    const data = await db
      .delete(notification_types)
      .where(eq(notification_types.notification_type_id, req.params.id as string))
      .returning();

    if (!data.length) {
      return res.status(404).json({ message: "Notification type not found" });
    }

    return res.status(200).json({ message: "Notification type deleted" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
