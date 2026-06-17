import { Router } from "express";
import { db } from "../../db/connection";
import z from "zod";
import { validateBody, validateParams, validateQuery } from "../../middleware/validations";
import { products, product_categories, product_conditions, product_status } from "../../db/ProductSchemas/ProductSchemas";

/** Router para el CRUD de productos. Prefijo: `/` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const productIdParamsSchema = z.object({
  id: z.string().uuid(),
});

/** Valida el body para crear o actualizar un producto */
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
});

/**
 * Obtiene la lista de todos los productos disponibles.
 * @route GET /product
 * @returns Lista de productos o error 500
 */
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

/**
 * Obtiene un producto por su ID.
 * @route GET /product/:id
 * @param id - UUID del producto
 * @returns El producto encontrado
 */
router.get("/product/:id", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Perfil del usuario",
    data: {
      id: `${req.params.id}`
    }
  });
});

/**
 * Crea un nuevo producto.
 * @route POST /product
 * @param body - Datos del producto validados con `createProductSchema`
 * @returns El producto creado con status 201
 */
router.post('/product', validateBody(createProductSchema), (req, res) => {
  return res.status(201).json({
    ok: true,
    message: "Se ha añadido el usuario",
    data: req.body
  })
});

/**
 * Actualiza un producto existente.
 * @route PUT /product/:id
 * @param id - UUID del producto a actualizar
 * @param body - Campos a actualizar validados con `createProductSchema`
 * @returns Mensaje de confirmacion o 400 si los datos son invalidos
 */
router.put('/product/:id', validateParams(productIdParamsSchema), validateBody(createProductSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    message: `Usuario con ID ${req.params.id} se ha actualizado`,
  });
});

/**
 * Elimina un producto por su ID.
 * @route DELETE /product/:id
 * @param id - UUID del producto a eliminar
 * @returns Mensaje de confirmacion o 400 si el UUID es invalido
 */
router.delete('/product/:id', validateParams(productIdParamsSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    message: `Usuario con ID ${req.params.id} se ha eliminado`,
  });
});

export default router;