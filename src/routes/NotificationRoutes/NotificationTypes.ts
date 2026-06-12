import { Router } from "express";
import { db } from "../../db/connection";
import { notification_types } from "../../db/NotificationSchemas/NotificationSchemas";
import z from "zod";
import { validateBody, validateParams } from "../../middleware/validations";

const router = Router();

const notificationTypeIdSchema = z.object({
  id: z.string().uuid(),
});

const createNotificationTypeSchema = z.object({
  notification_type_name: z.string().min(1),
});

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