import { Router } from "express";
import z from "zod";

import { register, login } from "../controllers/authController";
import { validateBody } from "../middleware/validations";
import { insert_user_schema } from "../db/schemas/UsersSchema";

const router = Router();

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

/**
 * Registra un nuevo usuario y devuelve un JWT.
 * @route POST /auth/register
 */
router.post("/register", validateBody(insert_user_schema), register);

/**
 * Autentica credenciales y devuelve un JWT con datos del usuario.
 * @route POST /auth/login
 */
router.post("/login", validateBody(loginSchema), login);

export default router;
