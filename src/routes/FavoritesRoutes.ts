import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { authenticateToken } from "../middleware/auth";
import { getUserFavorites, addFavorite, removeFavorite } from "../controllers/favoritesController";

const router = Router({ mergeParams: true });

const userIdSchema = z.object({ id: z.uuid() });
const productParamSchema = z.object({ id: z.uuid(), productId: z.uuid() });
const addFavoriteSchema = z.object({ product_id: z.uuid() });

router.get("/", validateParams(userIdSchema), getUserFavorites);
router.post("/", authenticateToken, validateParams(userIdSchema), validateBody(addFavoriteSchema), addFavorite);
router.delete("/:productId", authenticateToken, validateParams(productParamSchema), removeFavorite);

export default router;
