import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { products } from "../db/schemas/ProductsSchema";

/** Router para el CRUD de productos. Montado en `/api/products` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const getProductsByIdSchema = z.object({
  id: z.uuid(),
});

/** Valida el body para crear un producto */
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
  condition_id: z.uuid().optional(),
  status_id: z.uuid().optional(),
});

/** Valida el body para actualizar un producto (todos los campos opcionales) */
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  condition_id: z.uuid().optional(),
  status_id: z.uuid().optional(),
});

/**
 * Obtiene la lista de todos los productos disponibles.
 * @route GET /api/products
 * @returns Lista de productos o error 500
 */
router.get("/", async (_, res) => {
  try {
    const data = await db.select().from(products);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Obtiene un producto por su ID.
 * @route GET /api/products/:id
 * @param id - UUID del producto
 * @returns El producto encontrado, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(getProductsByIdSchema), async (req, res) => {
  try {
    const data = await db
      .select()
      .from(products)
      .where(eq(products.product_id, req.params.id as string));

    if (!data.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Crea un nuevo producto.
 * @route POST /api/products
 * @param body - `name`, `description`, `price`
 * @returns El producto creado con status 201, o 500 en error
 */
router.post("/", validateBody(createProductSchema), async (req, res) => {
  try {
    const data = await db
      .insert(products)
      .values(req.body)
      .returning();

    return res.status(201).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Actualiza un producto existente.
 * @route PUT /api/products/:id
 * @param id - UUID del producto a actualizar
 * @param body - Campos a actualizar: `name`, `description`, `price`
 * @returns El producto actualizado, 404 si no existe, o 500 en error
 */
router.put("/:id", validateParams(getProductsByIdSchema), validateBody(updateProductSchema), async (req, res) => {
    try {
      const data = await db
        .update(products)
        .set(req.body)
        .where(eq(products.product_id, req.params.id as string))
        .returning();

      if (!data.length) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(data[0]);
    } catch {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Elimina un producto por su ID.
 * @route DELETE /api/products/:id
 * @param id - UUID del producto a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(getProductsByIdSchema), async (req, res) => {
  try {
    const data = await db
      .delete(products)
      .where(eq(products.product_id, req.params.id as string))
      .returning();

    if (!data.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
