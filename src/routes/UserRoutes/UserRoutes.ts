import { Router } from "express";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "../../db/connection";
import { users, insert_user_schema, update_user_schema } from "../../db/UserSchemas/Users";
import { validateBody, validateParams } from "../../middleware/validations";

const router = Router();

const userIdSchema = z.object({
    id: z.string().uuid(),
});

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

export default router;