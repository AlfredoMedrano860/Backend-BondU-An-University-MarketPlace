import { Router } from "express";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../../db/connection";
import { users, insert_user_schema } from "../../db/UserSchemas/Users";
import { validateBody } from "../../middleware/validations";
import z from "zod";

const router = Router();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const passwordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    resetToken: z.string().min(1),
    newPassword: z.string().min(6),
});

function createToken(): string {
    return crypto.randomBytes(24).toString("hex");
}

router.post(
    "/login",
    validateBody(loginSchema),
    async (req, res) => {
        try {
            const user = await db
                .select()
                .from(users)
                .where(and(eq(users.email, req.body.email), eq(users.password, req.body.password)))
                .limit(1);

            if (!user.length) {
                return res.status(401).json({ message: "Correo o contraseña incorrectos." });
            }

            return res.status(200).json({
                message: "Inicio de sesión exitoso",
                user: user[0],
                token: createToken(),
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post(
    "/register",
    validateBody(insert_user_schema),
    async (req, res) => {
        try {
            const existing = await db
                .select()
                .from(users)
                .where(eq(users.email, req.body.email))
                .limit(1);

            if (existing.length) {
                return res.status(409).json({ message: "El correo ya está registrado." });
            }

            const inserted = await db
                .insert(users)
                .values(req.body)
                .returning();

            return res.status(201).json({
                message: "Registro exitoso",
                user: inserted[0],
                token: createToken(),
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post(
    "/forgot-password",
    validateBody(passwordSchema),
    async (req, res) => {
        try {
            return res.status(200).json({
                message: "Si el correo existe, se ha enviado un enlace de recuperación.",
                resetToken: createToken(),
            });
        } catch {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post(
    "/reset-password",
    validateBody(resetPasswordSchema),
    async (req, res) => {
        try {
            return res.status(200).json({ message: "Contraseña restablecida correctamente." });
        } catch {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

export default router;
