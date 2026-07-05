import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { authenticateToken } from "../middleware/auth";
import { getAllNotificationTypes, getNotificationTypeById, createNotificationType, updateNotificationType, deleteNotificationType } from "../controllers/notificationTypesController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createSchema = z.object({ notification_type_name: z.string().min(1) });
const updateSchema = z.object({ notification_type_name: z.string().min(1).optional() });

router.get("/", getAllNotificationTypes);
router.get("/:id", validateParams(idSchema), getNotificationTypeById);
router.post("/", authenticateToken, validateBody(createSchema), createNotificationType);
router.put("/:id", authenticateToken, validateParams(idSchema), validateBody(updateSchema), updateNotificationType);
router.delete("/:id", authenticateToken, validateParams(idSchema), deleteNotificationType);

export default router;
