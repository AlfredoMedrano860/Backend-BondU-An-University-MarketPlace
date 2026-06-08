import { Router } from "express";
import z from "zod";
import { db } from "../../db/connection";
import { product_conditions } from "../../db/ProductSchemas/ProductSchemas";
import { validateBody, validateParams } from "../../middleware/validations";

const router = Router();

const conditionIdSchema = z.object({
  id: z.string().uuid(),
});

const createConditionSchema = z.object({
  name_condition: z.string().min(1),
});

router.get("/conditions", async (_, res) => {
  try {
    const data = await db.select().from(product_conditions);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/conditions/:id", validateParams(conditionIdSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    id: req.params.id,
  });
});

router.post("/conditions", validateBody(createConditionSchema), (req, res) => {
  return res.status(201).json({
    ok: true,
    data: req.body,
  });
});

router.put(
  "/conditions/:id",
  validateParams(conditionIdSchema),
  validateBody(createConditionSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Condition ${req.params.id} updated`,
    });
  },
);

router.delete(
  "/conditions/:id",
  validateParams(conditionIdSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Condition ${req.params.id} deleted`,
    });
  },
);

export default router;
