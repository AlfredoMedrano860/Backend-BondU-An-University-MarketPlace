import { Router } from "express";
import { db } from "../../db/connection";
import { product_categories } from "../../db/ProductSchemas/ProductCategories";
import z from "zod";
import { validateBody, validateParams } from "../../middleware/validations";

/** Router para el CRUD de categorias de producto. Prefijo: `/` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const categoryIdSchema = z.object({
  id: z.string().uuid(),
});

/** Valida el body para crear o actualizar una categoria */
const createCategorySchema = z.object({
  name_category: z.string().min(1),
});

/**
 * Obtiene la lista de todas las categorias de producto.
 * @route GET /categories
 * @returns Lista de categorias o error 500
 */
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

/**
 * Obtiene una categoria por su ID.
 * @route GET /categories/:id
 * @param id - UUID de la categoria
 * @returns La categoria encontrada o 400 si el UUID es invalido
 */
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

/**
 * Crea una nueva categoria de producto.
 * @route POST /categories
 * @param body - Datos validados con `createCategorySchema`
 * @returns La categoria creada con status 201
 */
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

/**
 * Actualiza una categoria existente.
 * @route PUT /categories/:id
 * @param id - UUID de la categoria a actualizar
 * @param body - Campos a actualizar validados con `createCategorySchema`
 * @returns Mensaje de confirmacion o 400 si los datos son invalidos
 */
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

/**
 * Elimina una categoria por su ID.
 * @route DELETE /categories/:id
 * @param id - UUID de la categoria a eliminar
 * @returns Mensaje de confirmacion o 400 si el UUID es invalido
 */
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