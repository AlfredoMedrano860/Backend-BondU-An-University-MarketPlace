import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../db/connection";
import { user_roles } from "../db/schemas/UserRolesSchema";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para la asignacion de roles a usuarios. Montado en `/api/users/roles` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const getUserRolesByIdSchema = z.object({
    id: z.uuid(),
});

/** Valida el body para asignar un rol a un usuario */
const createUserRoleSchema = z.object({
    user_id: z.uuid(),
    role_type_id: z.uuid(),
});

/**
 * Obtiene la lista de todas las asignaciones de roles.
 * @route GET /api/users/roles
 * @returns Lista de roles asignados o error 500
 */
router.get("/", async (_, res) => {
    try {
        const data = await db.select().from(user_roles);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Obtiene una asignacion de rol por su ID.
 * @route GET /api/users/roles/:id
 * @param id - UUID de la asignacion de rol
 * @returns La asignacion encontrada, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(getUserRolesByIdSchema), async (req, res) => {
    try {
        const data = await db
            .select()
            .from(user_roles)
            .where(eq(user_roles.role_id, req.params.id as string));

        if (!data.length) {
            return res.status(404).json({ message: "User role not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Asigna un rol a un usuario.
 * @route POST /api/users/roles
 * @param body - `user_id` y `role_type_id` de la asignacion
 * @returns La asignacion creada con status 201, o 500 en error
 */
router.post("/", validateBody(createUserRoleSchema), async (req, res) => {
    try {
        const data = await db
            .insert(user_roles)
            .values(req.body)
            .returning();

        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Elimina una asignacion de rol por su ID.
 * @route DELETE /api/users/roles/:id
 * @param id - UUID de la asignacion a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(getUserRolesByIdSchema), async (req, res) => {
    try {
        const data = await db
            .delete(user_roles)
            .where(eq(user_roles.role_id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "User role not found" });
        }

        return res.status(200).json({ message: "User role deleted" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
