import { Router } from "express";
import { db } from "../../db/connection";
import { product_categories } from "../../db/ProductSchemas/ProductSchemas";
import z from "zod";
import { validateBody, validateParams } from "../../middleware/validations";

const router = Router();

const categoryIdSchema = z.object({
  id: z.string().uuid(),
});

const createCategorySchema = z.object({
  name_category: z.string().min(1),
});

router.get("/categories", async (_, res) => {
  try {
    const data = await db.select().from(product_categories);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get(
  "/categories/:id",
  validateParams(categoryIdSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      id: req.params.id,
    });
  }
);

router.post(
  "/categories",
  validateBody(createCategorySchema),
  (req, res) => {
    return res.status(201).json({
      ok: true,
      data: req.body,
    });
  }
);

router.put(
  "/categories/:id",
  validateParams(categoryIdSchema),
  validateBody(createCategorySchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Category ${req.params.id} updated`,
    });
  }
);

router.delete(
  "/categories/:id",
  validateParams(categoryIdSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Category ${req.params.id} deleted`,
    });
  }
);

export default router;