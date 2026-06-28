import { Router } from "express";
import z from "zod";

import { register, login, forgotPassword, resetPassword } from "../controllers/authController";
import { validateBody } from "../middleware/validations";

const router = Router();

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

/**
 * Registra un nuevo usuario y devuelve un JWT.
 * @route POST /auth/register
 */
router.post("/register", validateBody(registerSchema), register);

/**
 * Autentica credenciales y devuelve un JWT con datos del usuario.
 * @route POST /auth/login
 */
router.post("/login", validateBody(loginSchema), login);

const forgotPasswordSchema = z.object({
    email: z.email(),
});

const resetPasswordSchema = z.object({
    resetToken: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

/**
 * Genera un token de reset de 15 minutos para el email indicado.
 * @route POST /auth/forgot-password
 */
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);

/**
 * Verifica el token de reset y actualiza la contraseña del usuario.
 * @route POST /auth/reset-password
 */
router.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);

export default router;
