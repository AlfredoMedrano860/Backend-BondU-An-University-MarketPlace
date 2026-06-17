import { Router } from "express";
import { db } from "../../db/connection";
import { notification_types } from "../../db/NotificationSchemas/NotificationsTypes";
import z from "zod";
import { validateBody, validateParams } from "../../middleware/validations";

/** Router para el CRUD de tipos de notificacion. Prefijo: `/` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const notificationTypeIdSchema = z.object({
  id: z.string().uuid(),
});

/** Valida el body para crear o actualizar un tipo de notificacion */
const createNotificationTypeSchema = z.object({
  notification_type_name: z.string().min(1),
});

/**
 * Obtiene la lista de todos los tipos de notificacion.
 * @route GET /notification-types
 * @returns Lista de tipos de notificacion o error 500
 */
router.get("/notification-types", async (_, res) => {
  try {
    const data = await db
      .select()
      .from(notification_types);

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

/**
 * Obtiene un tipo de notificacion por su ID.
 * @route GET /notification-types/:id
 * @param id - UUID del tipo de notificacion
 * @returns El tipo encontrado o 400 si el UUID es invalido
 */
router.get(
  "/notification-types/:id",
  validateParams(notificationTypeIdSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      id: req.params.id,
    });
  }
);

/**
 * Crea un nuevo tipo de notificacion.
 * @route POST /notification-types
 * @param body - Datos validados con `createNotificationTypeSchema`
 * @returns El tipo creado con status 201
 */
router.post(
  "/notification-types",
  validateBody(createNotificationTypeSchema),
  (req, res) => {
    return res.status(201).json({
      ok: true,
      data: req.body,
    });
  }
);

/**
 * Actualiza un tipo de notificacion existente.
 * @route PUT /notification-types/:id
 * @param id - UUID del tipo a actualizar
 * @param body - Campos a actualizar validados con `createNotificationTypeSchema`
 * @returns Mensaje de confirmacion o 400 si los datos son invalidos
 */
router.put(
  "/notification-types/:id",
  validateParams(notificationTypeIdSchema),
  validateBody(createNotificationTypeSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Notification Type ${req.params.id} updated`,
    });
  }
);

/**
 * Elimina un tipo de notificacion por su ID.
 * @route DELETE /notification-types/:id
 * @param id - UUID del tipo a eliminar
 * @returns Mensaje de confirmacion o 400 si el UUID es invalido
 */
router.delete(
  "/notification-types/:id",
  validateParams(notificationTypeIdSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Notification Type ${req.params.id} deleted`,
    });
  }
);

export default router;