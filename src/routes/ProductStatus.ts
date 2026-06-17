import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { product_status } from "../db/schemas/ProductStatus";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para el CRUD de estados de producto (disponible, vendido, etc.). Montado en `/api/products/status` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const getProductStatusByIdSchema = z.object({
  id: z.uuid(),
});

/** Valida el body para crear un estado */
const createStatusSchema = z.object({
  name_status: z.string().min(1),
});

/** Valida el body para actualizar un estado (todos los campos opcionales) */
const updateStatusSchema = z.object({
  name_status: z.string().min(1).optional(),
});

/**
 * Obtiene la lista de todos los estados de producto.
 * @route GET /api/products/status
 * @returns Lista de estados o error 500
 */
router.get("/", async (_, res) => {
  try {
    const data = await db.select().from(product_status);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Obtiene un estado por su ID.
 * @route GET /api/products/status/:id
 * @param id - UUID del estado
 * @returns El estado encontrado, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(getProductStatusByIdSchema), async (req, res) => {
  try {
    const data = await db
      .select()
      .from(product_status)
      .where(eq(product_status.status_id, req.params.id as string));

    if (!data.length) {
      return res.status(404).json({ message: "Status not found" });
    }

    return res.status(200).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Crea un nuevo estado de producto.
 * @route POST /api/products/status
 * @param body - `name_status`
 * @returns El estado creado con status 201, o 500 en error
 */
router.post("/", validateBody(createStatusSchema), async (req, res) => {
  try {
    const data = await db
      .insert(product_status)
      .values(req.body)
      .returning();

    return res.status(201).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Actualiza un estado existente.
 * @route PUT /api/products/status/:id
 * @param id - UUID del estado a actualizar
 * @param body - `name_status` a actualizar
 * @returns El estado actualizado, 404 si no existe, o 500 en error
 */
router.put("/:id", validateParams(getProductStatusByIdSchema), validateBody(updateStatusSchema), async (req, res) => {
    try {
      const data = await db
        .update(product_status)
        .set(req.body)
        .where(eq(product_status.status_id, req.params.id as string))
        .returning();

      if (!data.length) {
        return res.status(404).json({ message: "Status not found" });
      }

      return res.status(200).json(data[0]);
    } catch {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Elimina un estado por su ID.
 * @route DELETE /api/products/status/:id
 * @param id - UUID del estado a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(getProductStatusByIdSchema), async (req, res) => {
  try {
    const data = await db
      .delete(product_status)
      .where(eq(product_status.status_id, req.params.id as string))
      .returning();

    if (!data.length) {
      return res.status(404).json({ message: "Status not found" });
    }

    return res.status(200).json({ message: "Status deleted" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
