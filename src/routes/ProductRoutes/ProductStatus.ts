import { Router } from "express";
import z from "zod";
import { db } from "../../db/connection";
import { product_status } from "../../db/ProductSchemas/ProductSchemas";
import { validateBody, validateParams } from "../../middleware/validations";

const router = Router();

const statusIdSchema = z.object({
  id: z.string().uuid(),
});

const createStatusSchema = z.object({
  name_status: z.string().min(1),
});

router.get("/status", async (_, res) => {
  try {
    const data = await db.select().from(product_status);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/status/:id", validateParams(statusIdSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    id: req.params.id,
  });
});

router.post("/status", validateBody(createStatusSchema), (req, res) => {
  return res.status(201).json({
    ok: true,
    data: req.body,
  });
});

router.put(
  "/status/:id",
  validateParams(statusIdSchema),
  validateBody(createStatusSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Status ${req.params.id} updated`,
    });
  },
);

router.delete("/status/:id", validateParams(statusIdSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    message: `Status ${req.params.id} deleted`,
  });
});

export default router;
