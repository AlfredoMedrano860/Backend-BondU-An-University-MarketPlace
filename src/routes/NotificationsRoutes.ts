import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { authenticateToken } from "../middleware/auth";
import { getAllNotifications, getNotificationById, createNotification, updateNotification, deleteNotification } from "../controllers/notificationsController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createNotificationSchema = z.object({
    notification_type_id: z.uuid(),
    is_read: z.boolean().optional(),
    read_at: z.iso.datetime().optional(),
});

const updateNotificationSchema = z.object({
    is_read: z.boolean().optional(),
    read_at: z.iso.datetime().optional(),
});

router.get("/", authenticateToken, getAllNotifications);
router.get("/:id", authenticateToken, validateParams(idSchema), getNotificationById);
router.post("/", authenticateToken, validateBody(createNotificationSchema), createNotification);
router.put("/:id", authenticateToken, validateParams(idSchema), validateBody(updateNotificationSchema), updateNotification);
router.delete("/:id", authenticateToken, validateParams(idSchema), deleteNotification);

export default router;
