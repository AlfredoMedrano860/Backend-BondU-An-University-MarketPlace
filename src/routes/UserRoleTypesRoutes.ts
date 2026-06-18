import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllRoleTypes, getRoleTypeById, createRoleType, updateRoleType, deleteRoleType } from "../controllers/userRoleTypesController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createRoleTypeSchema = z.object({ role_name: z.string().min(1) });
const updateRoleTypeSchema = z.object({ role_name: z.string().min(1).optional() });

router.get("/", getAllRoleTypes);
router.get("/:id", validateParams(idSchema), getRoleTypeById);
router.post("/", validateBody(createRoleTypeSchema), createRoleType);
router.put("/:id", validateParams(idSchema), validateBody(updateRoleTypeSchema), updateRoleType);
router.delete("/:id", validateParams(idSchema), deleteRoleType);

export default router;
