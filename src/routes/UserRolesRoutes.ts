import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllUserRoles, getUserRoleById, createUserRole, deleteUserRole } from "../controllers/userRolesController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createUserRoleSchema = z.object({
    user_id: z.uuid(),
    role_type_id: z.uuid(),
});

router.get("/", getAllUserRoles);
router.get("/:id", validateParams(idSchema), getUserRoleById);
router.post("/", validateBody(createUserRoleSchema), createUserRole);
router.delete("/:id", validateParams(idSchema), deleteUserRole);

export default router;
