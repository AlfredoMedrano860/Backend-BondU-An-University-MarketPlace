import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../db/connection";
import { user_preferences } from "../db/schemas/UserPreferences";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para las preferencias de usuario. Montado en `/api/users/preferences` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const preferenceIdSchema = z.object({
    id: z.string().uuid(),
});

/** Valida el body para crear preferencias de usuario */
const createUserPreferencesSchema = z.object({
    user_id: z.string().uuid(),
    notifications: z.boolean().optional(),
    language: z.string().optional(),
});

/** Valida el body para actualizar preferencias de usuario */
const updateUserPreferencesSchema = z.object({
    notifications: z.boolean().optional(),
    language: z.string().optional(),
});

/**
 * Obtiene la lista de todas las preferencias de usuario.
 * @route GET /api/users/preferences
 * @returns Lista de preferencias o error 500
 */
router.get("/", async (_, res) => {
    try {
        const data = await db.select().from(user_preferences);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Obtiene las preferencias de un usuario por su ID de preferencia.
 * @route GET /api/users/preferences/:id
 * @param id - UUID del registro de preferencias
 * @returns Las preferencias encontradas, 404 si no existen, o 500 en error
 */
router.get("/:id", validateParams(preferenceIdSchema), async (req, res) => {
    try {
        const data = await db
            .select()
            .from(user_preferences)
            .where(eq(user_preferences.preference_id, req.params.id as string));

        if (!data.length) {
            return res.status(404).json({ message: "Preferences not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Crea un registro de preferencias para un usuario.
 * @route POST /api/users/preferences
 * @param body - `user_id`, y opcionalmente `notifications` y `language`
 * @returns Las preferencias creadas con status 201, o 500 en error
 */
router.post("/", validateBody(createUserPreferencesSchema), async (req, res) => {
    try {
        const data = await db
            .insert(user_preferences)
            .values(req.body)
            .returning();

        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Actualiza las preferencias de un usuario.
 * @route PUT /api/users/preferences/:id
 * @param id - UUID del registro de preferencias
 * @param body - `notifications` y/o `language` a actualizar
 * @returns Las preferencias actualizadas, 404 si no existen, o 500 en error
 */
router.put("/:id", validateParams(preferenceIdSchema), validateBody(updateUserPreferencesSchema), async (req, res) => {
        try {
            const data = await db
                .update(user_preferences)
                .set(req.body)
                .where(eq(user_preferences.preference_id, req.params.id as string))
                .returning();

            if (!data.length) {
                return res.status(404).json({ message: "Preferences not found" });
            }

            return res.status(200).json(data[0]);
        } catch {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

/**
 * Elimina las preferencias de un usuario.
 * @route DELETE /api/users/preferences/:id
 * @param id - UUID del registro de preferencias a eliminar
 * @returns Mensaje de confirmacion, 404 si no existen, o 500 en error
 */
router.delete("/:id", validateParams(preferenceIdSchema), async (req, res) => {
    try {
        const data = await db
            .delete(user_preferences)
            .where(eq(user_preferences.preference_id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "Preferences not found" });
        }

        return res.status(200).json({ message: "Preferences deleted" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
