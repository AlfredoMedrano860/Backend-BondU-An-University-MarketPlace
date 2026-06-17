import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../../db/connection";
import { users, insert_user_schema, update_user_schema } from "../../db/UserSchemas/Users";
import { validateBody, validateParams } from "../../middleware/validations";
import {login, register} from '../../db/controllers/userController';

/** Router para el CRUD de usuarios y autenticacion. Prefijo: `/users` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const userIdSchema = z.object({
    id: z.string().uuid(),
});

/** Valida las credenciales del body para el login */
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

/**
 * Obtiene la lista de todos los usuarios registrados.
 * @route GET /users
 * @returns Lista de usuarios o error 500
 */
router.get("/", async (_, res) => {
    try {
        const data = await db.select().from(users);
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

/**
 * Obtiene un usuario por su ID.
 * @route GET /users/:id
 * @param id - UUID del usuario
 * @returns El usuario encontrado, 404 si no existe, o 500 en error
 */
router.get("/:id",
    validateParams(userIdSchema),
    async (req, res) => {
        try {
            const data = await db
                .select()
                .from(users)
                .where(eq(users.id, req.params.id as string));

            if (!data.length) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            return res.status(200).json(data[0]);
        } catch {
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

/**
 * Crea un nuevo usuario.
 * @route POST /users
 * @param body - Datos del usuario validados con `insert_user_schema`
 * @returns El usuario creado con status 201, o 500 en error
 */
router.post("/",
    validateBody(insert_user_schema),
    async (req, res) => {
        try {
            const data = await db
                .insert(users)
                .values(req.body)
                .returning();

            return res.status(201).json(data[0]);
        } catch {
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

/**
 * Actualiza los datos de un usuario existente.
 * @route PUT /users/:id
 * @param id - UUID del usuario a actualizar
 * @param body - Campos a actualizar validados con `update_user_schema`
 * @returns El usuario actualizado, 404 si no existe, o 500 en error
 */
router.put("/:id",
    validateParams(userIdSchema),
    validateBody(update_user_schema),
    async (req, res) => {
        try {
            const data = await db
                .update(users)
                .set(req.body)
                .where(eq(users.id, req.params.id as string))
                .returning();

            if (!data.length) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            return res.status(200).json(data[0]);
        } catch {
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

/**
 * Elimina un usuario por su ID.
 * @route DELETE /users/:id
 * @param id - UUID del usuario a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id",
    validateParams(userIdSchema),
    async (req, res) => {
        try {
            const data = await db
                .delete(users)
                .where(eq(users.id, req.params.id as string))
                .returning();

            if (!data.length) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            return res.status(200).json({
                message: "User deleted",
            });
        } catch {
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

/**
 * Autentica a un usuario y devuelve un token JWT.
 * @route POST /users/login
 * @param body - `email` y `password` del usuario
 */
router.post("/login",validateBody(loginSchema), login)

/**
 * Registra un nuevo usuario en el sistema.
 * @route POST /users/register
 * @param body - Datos del usuario validados con `insert_user_schema`
 */
router.post("/register", validateBody(insert_user_schema), register);
export default router;