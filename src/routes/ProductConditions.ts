import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { product_conditions } from "../db/schemas/ProductConditions";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";

/** Router para el CRUD de condiciones de producto (nuevo, usado, etc.). Montado en `/api/products/conditions` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const getProductConditionsByIdSchema = z.object({
  id: z.uuid(),
});

/** Valida el body para crear una condicion */
const createConditionSchema = z.object({
  name_condition: z.string().min(1),
});

/** Valida el body para actualizar una condicion (todos los campos opcionales) */
const updateConditionSchema = z.object({
  name_condition: z.string().min(1).optional(),
});

/**
 * Obtiene la lista de todas las condiciones de producto.
 * @route GET /api/products/conditions
 * @returns Lista de condiciones o error 500
 */
router.get("/", async (_, res) => {
  try {
    const data = await db.select().from(product_conditions);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Obtiene una condicion por su ID.
 * @route GET /api/products/conditions/:id
 * @param id - UUID de la condicion
 * @returns La condicion encontrada, 404 si no existe, o 500 en error
 */
router.get("/:id", validateParams(getProductConditionsByIdSchema), async (req, res) => {
  try {
    const data = await db
      .select()
      .from(product_conditions)
      .where(eq(product_conditions.condition_id, req.params.id as string));

    if (!data.length) {
      return res.status(404).json({ message: "Condition not found" });
    }

    return res.status(200).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Crea una nueva condicion de producto.
 * @route POST /api/products/conditions
 * @param body - `name_condition`
 * @returns La condicion creada con status 201, o 500 en error
 */
router.post("/", validateBody(createConditionSchema), async (req, res) => {
  try {
    const data = await db
      .insert(product_conditions)
      .values(req.body)
      .returning();

    return res.status(201).json(data[0]);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Actualiza una condicion existente.
 * @route PUT /api/products/conditions/:id
 * @param id - UUID de la condicion a actualizar
 * @param body - `name_condition` a actualizar
 * @returns La condicion actualizada, 404 si no existe, o 500 en error
 */
router.put("/:id", validateParams(getProductConditionsByIdSchema), validateBody(updateConditionSchema), async (req, res) => {
    try {
      const data = await db
        .update(product_conditions)
        .set(req.body)
        .where(eq(product_conditions.condition_id, req.params.id as string))
        .returning();

      if (!data.length) {
        return res.status(404).json({ message: "Condition not found" });
      }

      return res.status(200).json(data[0]);
    } catch {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Elimina una condicion por su ID.
 * @route DELETE /api/products/conditions/:id
 * @param id - UUID de la condicion a eliminar
 * @returns Mensaje de confirmacion, 404 si no existe, o 500 en error
 */
router.delete("/:id", validateParams(getProductConditionsByIdSchema), async (req, res) => {
  try {
    const data = await db
      .delete(product_conditions)
      .where(eq(product_conditions.condition_id, req.params.id as string))
      .returning();

    if (!data.length) {
      return res.status(404).json({ message: "Condition not found" });
    }

    return res.status(200).json({ message: "Condition deleted" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
