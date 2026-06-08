import { Router } from "express";
import { db } from "../../db/connection";
import { notifications } from "../../db/NotificationSchemas/NotificationSchemas";
import z from "zod";
import { validateBody, validateParams } from "../../middleware/validations";

const router = Router();

const notificationIdSchema = z.object({
  id: z.string().uuid(),
});

const createNotificationSchema = z.object({
  notification_type_id: z.string().uuid(),
  is_read: z.boolean().optional(),
  read_at: z.string().datetime().optional(),
});

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
