import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllConditions, getConditionById, createCondition, updateCondition, deleteCondition } from "../controllers/productConditionsController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createConditionSchema = z.object({ name_condition: z.string().min(1) });
const updateConditionSchema = z.object({ name_condition: z.string().min(1).optional() });

router.get("/", getAllConditions);
router.get("/:id", validateParams(idSchema), getConditionById);
router.post("/", validateBody(createConditionSchema), createCondition);
router.put("/:id", validateParams(idSchema), validateBody(updateConditionSchema), updateCondition);
router.delete("/:id", validateParams(idSchema), deleteCondition);

export default router;
