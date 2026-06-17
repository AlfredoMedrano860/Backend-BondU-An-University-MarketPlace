import { Router } from "express";
import z from "zod";
import { db } from "../../db/connection";
import { product_status } from "../../db/ProductSchemas/ProductStatus";
import { validateBody, validateParams } from "../../middleware/validations";

/** Router para el CRUD de estados de producto (disponible, vendido, etc.). Prefijo: `/` */
const router = Router();

/** Valida que el parametro `id` de la ruta sea un UUID valido */
const statusIdSchema = z.object({
  id: z.string().uuid(),
});

/** Valida el body para crear o actualizar un estado */
const createStatusSchema = z.object({
  name_status: z.string().min(1),
});

/**
 * Obtiene la lista de todos los estados de producto.
 * @route GET /status
 * @returns Lista de estados o error 500
 */
router.get("/status", async (_, res) => {
  try {
    const data = await db.select().from(product_status);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

/**
 * Obtiene un estado por su ID.
 * @route GET /status/:id
 * @param id - UUID del estado
 * @returns El estado encontrado o 400 si el UUID es invalido
 */
router.get("/status/:id", validateParams(statusIdSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    id: req.params.id,
  });
});

/**
 * Crea un nuevo estado de producto.
 * @route POST /status
 * @param body - Datos validados con `createStatusSchema`
 * @returns El estado creado con status 201
 */
router.post("/status", validateBody(createStatusSchema), (req, res) => {
  return res.status(201).json({
    ok: true,
    data: req.body,
  });
});

/**
 * Actualiza un estado existente.
 * @route PUT /status/:id
 * @param id - UUID del estado a actualizar
 * @param body - Campos a actualizar validados con `createStatusSchema`
 * @returns Mensaje de confirmacion o 400 si los datos son invalidos
 */
router.put(
  "/status/:id",
  validateParams(statusIdSchema),
  validateBody(createStatusSchema),
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: `Status ${req.params.id} updated`,
    });
  },
);

/**
 * Elimina un estado por su ID.
 * @route DELETE /status/:id
 * @param id - UUID del estado a eliminar
 * @returns Mensaje de confirmacion o 400 si el UUID es invalido
 */
router.delete("/status/:id", validateParams(statusIdSchema), (req, res) => {
  return res.status(200).json({
    ok: true,
    message: `Status ${req.params.id} deleted`,
  });
});

export default router;
