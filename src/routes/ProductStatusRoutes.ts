import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllStatus, getStatusById, createStatus, updateStatus, deleteStatus } from "../controllers/productStatusController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createStatusSchema = z.object({ name_status: z.string().min(1) });
const updateStatusSchema = z.object({ name_status: z.string().min(1).optional() });

router.get("/", getAllStatus);
router.get("/:id", validateParams(idSchema), getStatusById);
router.post("/", validateBody(createStatusSchema), createStatus);
router.put("/:id", validateParams(idSchema), validateBody(updateStatusSchema), updateStatus);
router.delete("/:id", validateParams(idSchema), deleteStatus);

export default router;
