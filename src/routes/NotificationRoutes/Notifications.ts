import { Router } from "express";
import { db } from "../../db/connection";
import { notifications } from "../../db/NotificationSchemas/NotificatioSchemas";
import z from "zod";
import { validateBody, validateParams } from "../../middleware/validations";

/** Router para el CRUD de notificaciones. Prefijo: `/` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const notificationIdSchema = z.object({
  id: z.string().uuid(),
});

/** Valida el body para crear o actualizar una notificacion */
const createNotificationSchema = z.object({
  notification_type_id: z.string().uuid(),
  is_read: z.boolean().optional(),
  read_at: z.iso.datetime().optional(),
});

/**
 * Obtiene la lista de todas las notificaciones.
 * @route GET /notifications
 * @returns Lista de notificaciones o error 500
 */
router.get("/notifications", async (_, res) => {
  try {
    const data = await db.select().from(notifications);

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

/**
 * Obtiene una notificacion por su ID.
 * @route GET /notifications/:id
 * @param id - UUID de la notificacion
 * @returns La notificacion encontrada o 400 si el UUID es invalido
 */
router.get(
  "/notifications/:id",
  validateParams(notificationIdSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      id: req.params.id,
    });
  },
);

/**
 * Crea una nueva notificacion.
 * @route POST /notifications
 * @param body - Datos validados con `createNotificationSchema`
 * @returns La notificacion creada con status 201
 */
router.post(
  "/notifications",
  validateBody(createNotificationSchema),
  (req, res) => {
    return res.status(201).json({
      ok: true,
      data: req.body,
    });
  },
);

/**
 * Actualiza una notificacion existente.
 * @route PUT /notifications/:id
 * @param id - UUID de la notificacion a actualizar
 * @param body - Campos a actualizar validados con `createNotificationSchema`
 * @returns Mensaje de confirmacion o 400 si los datos son invalidos
 */
router.put(
  "/notifications/:id",
  validateParams(notificationIdSchema),
  validateBody(createNotificationSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Notification ${req.params.id} updated`,
    });
  },
);

/**
 * Elimina una notificacion por su ID.
 * @route DELETE /notifications/:id
 * @param id - UUID de la notificacion a eliminar
 * @returns Mensaje de confirmacion o 400 si el UUID es invalido
 */
router.delete(
  "/notifications/:id",
  validateParams(notificationIdSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Notification ${req.params.id} deleted`,
    });
  },
);

export default router;
