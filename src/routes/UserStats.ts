import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../db/connection";
import { user_stats } from "../db/schemas/UserStats";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para las estadisticas de usuario. Montado en `/api/users/stats` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const statsIdSchema = z.object({
    id: z.string().uuid(),
});

/** Valida el body para crear estadisticas de usuario */
const createUserStatsSchema = z.object({
    user_id: z.string().uuid(),
    rating_avg: z.string().optional(),
    review_count: z.number().int().nonnegative().optional(),
    sales_count: z.number().int().nonnegative().optional(),
});

/** Valida el body para actualizar estadisticas de usuario */
const updateUserStatsSchema = z.object({
    rating_avg: z.string().optional(),
    review_count: z.number().int().nonnegative().optional(),
    sales_count: z.number().int().nonnegative().optional(),
});

/**
 * Obtiene la lista de estadisticas de todos los usuarios.
 * @route GET /api/users/stats
 * @returns Lista de estadisticas o error 500
 */
router.get("/", async (_, res) => {
    try {
        const data = await db.select().from(user_stats);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Obtiene las estadisticas de un usuario por su ID de stats.
 * @route GET /api/users/stats/:id
 * @param id - UUID del registro de estadisticas
 * @returns Las estadisticas encontradas, 404 si no existen, o 500 en error
 */
router.get("/:id", validateParams(statsIdSchema), async (req, res) => {
    try {
        const data = await db
            .select()
            .from(user_stats)
            .where(eq(user_stats.id, req.params.id as string));

        if (!data.length) {
            return res.status(404).json({ message: "Stats not found" });
        }

        return res.status(200).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Crea un registro de estadisticas para un usuario.
 * @route POST /api/users/stats
 * @param body - `user_id`, y opcionalmente `rating_avg`, `review_count`, `sales_count`
 * @returns Las estadisticas creadas con status 201, o 500 en error
 */
router.post("/", validateBody(createUserStatsSchema), async (req, res) => {
    try {
        const data = await db
            .insert(user_stats)
            .values(req.body)
            .returning();

        return res.status(201).json(data[0]);
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Actualiza las estadisticas de un usuario.
 * @route PUT /api/users/stats/:id
 * @param id - UUID del registro de estadisticas
 * @param body - `rating_avg`, `review_count` y/o `sales_count` a actualizar
 * @returns Las estadisticas actualizadas, 404 si no existen, o 500 en error
 */
router.put("/:id", validateParams(statsIdSchema), validateBody(updateUserStatsSchema), async (req, res) => {
        try {
            const data = await db
                .update(user_stats)
                .set(req.body)
                .where(eq(user_stats.id, req.params.id as string))
                .returning();

            if (!data.length) {
                return res.status(404).json({ message: "Stats not found" });
            }

            return res.status(200).json(data[0]);
        } catch {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

/**
 * Elimina las estadisticas de un usuario.
 * @route DELETE /api/users/stats/:id
 * @param id - UUID del registro de estadisticas a eliminar
 * @returns Mensaje de confirmacion, 404 si no existen, o 500 en error
 */
router.delete("/:id", validateParams(statsIdSchema), async (req, res) => {
    try {
        const data = await db
            .delete(user_stats)
            .where(eq(user_stats.id, req.params.id as string))
            .returning();

        if (!data.length) {
            return res.status(404).json({ message: "Stats not found" });
        }

        return res.status(200).json({ message: "Stats deleted" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
