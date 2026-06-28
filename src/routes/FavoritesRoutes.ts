import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { getUserFavorites, addFavorite, removeFavorite } from "../controllers/favoritesController";

const router = Router({ mergeParams: true });

const userIdSchema = z.object({ id: z.uuid() });
const productParamSchema = z.object({ id: z.uuid(), productId: z.uuid() });
const addFavoriteSchema = z.object({ product_id: z.uuid() });

router.get("/", validateParams(userIdSchema), getUserFavorites);
router.post("/", validateParams(userIdSchema), validateBody(addFavoriteSchema), addFavorite);
router.delete("/:productId", validateParams(productParamSchema), removeFavorite);

export default router;
