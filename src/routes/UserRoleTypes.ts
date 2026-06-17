import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../db/connection";
import { user_role_types } from "../db/schemas/UserRoleTypes";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para el catalogo de tipos de rol (seller, buyer, admin). Montado en `/api/users/role-types` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const getUserRoleTypesByIdSchema = z.object({
    id: z.uuid(),
});

/** Valida el body para crear un tipo de rol */
const createRoleTypeSchema = z.object({
    role_name: z.string().min(1),
});

/** Valida el body para actualizar un tipo de rol */
const updateRoleTypeSchema = z.object({
    role_name: z.string().min(1).optional(),
});

/**
 * Obtiene la lista de todos los tipos de rol disponibles.
 * @route GET /api/users/role-types
 * @returns Lista de tipos de rol o error 500
 */
router.get("/", async (_, res) => {
    try {
        const data = await db.select().from(user_role_types);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Obtiene un tipo de rol por su ID.
 * @route GET /api/users/role-types/:id
 * @param id - UUID del tipo de rol
 * @returns El tipo de rol encontrado, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(getUserRoleTypesByIdSchema), async (req, res) => {
    try {
        const data = await db
            .select()
            .from(user_role_types)
            .where(eq(user_role_types.role_type_id, req.params.id as string));

        if (!data.length) {
            return res.status(404).json({ message: "Role type not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Crea un nuevo tipo de rol.
 * @route POST /api/users/role-types
 * @param body - `role_name` del nuevo tipo
 * @returns El tipo de rol creado con status 201, o 500 en error
 */
router.post("/", validateBody(createRoleTypeSchema), async (req, res) => {
    try {
        const data = await db
            .insert(user_role_types)
            .values(req.body)
            .returning();

        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Actualiza un tipo de rol existente.
 * @route PUT /api/users/role-types/:id
 * @param id - UUID del tipo de rol a actualizar
 * @param body - `role_name` a actualizar
 * @returns El tipo de rol actualizado, 404 si no existe, o 500 en error
 */
router.put("/:id", validateParams(getUserRoleTypesByIdSchema), validateBody(updateRoleTypeSchema), async (req, res) => {
        try {
            const data = await db
                .update(user_role_types)
                .set(req.body)
                .where(eq(user_role_types.role_type_id, req.params.id as string))
                .returning();

            if (!data.length) {
                return res.status(404).json({ message: "Role type not found" });
            }

            return res.status(200).json(data[0]);
        } catch {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

/**
 * Elimina un tipo de rol por su ID.
 * @route DELETE /api/users/role-types/:id
 * @param id - UUID del tipo de rol a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(getUserRoleTypesByIdSchema), async (req, res) => {
    try {
        const data = await db
            .delete(user_role_types)
            .where(eq(user_role_types.role_type_id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "Role type not found" });
        }

        return res.status(200).json({ message: "Role type deleted" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
