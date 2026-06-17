import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { product_categories } from "../db/schemas/ProductCategoriesSchema";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para el CRUD de categorias de producto. Montado en `/api/products/categories` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const getProductCategoriesByIdSchema = z.object({
  id: z.uuid(),
});

/** Valida el body para crear una categoria */
const createCategorySchema = z.object({
  name_category: z.string().min(1),
});

/** Valida el body para actualizar una categoria (todos los campos opcionales) */
const updateCategorySchema = z.object({
  name_category: z.string().min(1).optional(),
});

/**
 * Obtiene la lista de todas las categorias de producto.
 * @route GET /api/products/categories
 * @returns Lista de categorias o error 500
 */
router.get("/", async (_, res) => {
  try {
    const data = await db.select().from(product_categories);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Obtiene una categoria por su ID.
 * @route GET /api/products/categories/:id
 * @param id - UUID de la categoria
 * @returns La categoria encontrada, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(getProductCategoriesByIdSchema), async (req, res) => {
  try {
    const data = await db
      .select()
      .from(product_categories)
      .where(eq(product_categories.category_id, req.params.id as string));

    if (!data.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Crea una nueva categoria de producto.
 * @route POST /api/products/categories
 * @param body - `name_category`
 * @returns La categoria creada con status 201, o 500 en error
 */
router.post("/", validateBody(createCategorySchema), async (req, res) => {
  try {
    const data = await db
      .insert(product_categories)
      .values(req.body)
      .returning();

    return res.status(201).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Actualiza una categoria existente.
 * @route PUT /api/products/categories/:id
 * @param id - UUID de la categoria a actualizar
 * @param body - `name_category` a actualizar
 * @returns La categoria actualizada, 404 si no existe, o 500 en error
 */
router.put("/:id", validateParams(getProductCategoriesByIdSchema), validateBody(updateCategorySchema), async (req, res) => {
    try {
      const data = await db
        .update(product_categories)
        .set(req.body)
        .where(eq(product_categories.category_id, req.params.id as string))
        .returning();

      if (!data.length) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.status(200).json(data[0]);
    } catch {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Elimina una categoria por su ID.
 * @route DELETE /api/products/categories/:id
 * @param id - UUID de la categoria a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(getProductCategoriesByIdSchema), async (req, res) => {
  try {
    const data = await db
      .delete(product_categories)
      .where(eq(product_categories.category_id, req.params.id as string))
      .returning();

    if (!data.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
