import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/productCategoriesController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

const createCategorySchema = z.object({ name_category: z.string().min(1) });
const updateCategorySchema = z.object({ name_category: z.string().min(1).optional() });

router.get("/", getAllCategories);
router.get("/:id", validateParams(idSchema), getCategoryById);
router.post("/", validateBody(createCategorySchema), createCategory);
router.put("/:id", validateParams(idSchema), validateBody(updateCategorySchema), updateCategory);
router.delete("/:id", validateParams(idSchema), deleteCategory);

export default router;
