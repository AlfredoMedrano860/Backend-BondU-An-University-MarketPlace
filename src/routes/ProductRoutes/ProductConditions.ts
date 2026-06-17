import { Router } from "express";
import z from "zod";
import { db } from "../../db/connection";
import { product_conditions } from "../../db/ProductSchemas/ProductConditions";
import { validateBody, validateParams } from "../../middleware/validations";

/** Router para el CRUD de condiciones de producto (nuevo, usado, etc.). Prefijo: `/` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const conditionIdSchema = z.object({
  id: z.string().uuid(),
});

/** Valida el body para crear o actualizar una condicion */
const createConditionSchema = z.object({
  name_condition: z.string().min(1),
});

/**
 * Obtiene la lista de todas las condiciones de producto.
 * @route GET /conditions
 * @returns Lista de condiciones o error 500
 */
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

/**
 * Obtiene una condicion por su ID.
 * @route GET /conditions/:id
 * @param id - UUID de la condicion
 * @returns La condicion encontrada o 400 si el UUID es invalido
 */
router.get("/conditions/:id", validateParams(conditionIdSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    id: req.params.id,
  });
});

/**
 * Crea una nueva condicion de producto.
 * @route POST /conditions
 * @param body - Datos validados con `createConditionSchema`
 * @returns La condicion creada con status 201
 */
router.post("/conditions", validateBody(createConditionSchema), (req, res) => {
  return res.status(201).json({
    ok: true,
    data: req.body,
  });
});

/**
 * Actualiza una condicion existente.
 * @route PUT /conditions/:id
 * @param id - UUID de la condicion a actualizar
 * @param body - Campos a actualizar validados con `createConditionSchema`
 * @returns Mensaje de confirmacion o 400 si los datos son invalidos
 */
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

/**
 * Elimina una condicion por su ID.
 * @route DELETE /conditions/:id
 * @param id - UUID de la condicion a eliminar
 * @returns Mensaje de confirmacion o 400 si el UUID es invalido
 */
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
