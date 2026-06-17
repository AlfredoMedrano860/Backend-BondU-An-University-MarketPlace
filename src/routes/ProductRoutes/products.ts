import { Router } from "express";
import { db } from "../../db/connection";
import z from "zod";
import { validateBody, validateParams, validateQuery } from "../../middleware/validations";
import { products, product_categories, product_conditions, product_status } from "../../db/ProductSchemas/ProductSchemas";


const router = Router();

const productIdParamsSchema = z.object({
  id: z.string().uuid(),
});
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
});

router.get("/product", async (req, res) => {
  try {
    const data = await db.select().from(products);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/product/:id", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Perfil del usuario",
    data: {
      id: `${req.params.id}`
    }
  });
});

router.post('/product', validateBody(createProductSchema), (req, res) => {
  return res.status(201).json({
    ok: true,
    message: "Se ha añadido el usuario",
    data: req.body
  })
});

router.put('/product/:id', validateParams(productIdParamsSchema), validateBody(createProductSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    message: `Usuario con ID ${req.params.id} se ha actualizado`,
  });
});

router.delete('/product/:id', validateParams(productIdParamsSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    message: `Usuario con ID ${req.params.id} se ha eliminado`,
  });
});

//Product Cathegories




export default router;