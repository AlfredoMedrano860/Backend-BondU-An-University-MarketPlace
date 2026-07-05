import { Router } from "express";
import z from "zod";
import { validateBody, validateParams, validateFile, validateImageContent } from "../middleware/validations";
import { upload } from "../middleware/upload";
import { authenticateToken } from "../middleware/auth";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, sellProduct } from "../controllers/productsController";
import { getProductImages, uploadProductImage, deleteProductImage, setPrimaryImage } from "../controllers/productImagesController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });
const imageIdSchema = z.object({ id: z.uuid(), imageId: z.uuid() });

const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().int().positive(),
    seller_id: z.uuid(),
    condition_id: z.uuid().optional(),
    status_id: z.uuid().optional(),
});

const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().int().positive().optional(),
    condition_id: z.uuid().optional(),
    status_id: z.uuid().optional(),
});

router.get("/", getAllProducts);
router.get("/:id", validateParams(idSchema), getProductById);
router.post("/", authenticateToken, validateBody(createProductSchema), createProduct);
router.put("/:id", authenticateToken, validateParams(idSchema), validateBody(updateProductSchema), updateProduct);
router.delete("/:id", authenticateToken, validateParams(idSchema), deleteProduct);
router.patch("/:id/sell", authenticateToken, validateParams(idSchema), sellProduct);

// Imagenes del producto
router.get("/:id/images", validateParams(idSchema), getProductImages);
router.post("/:id/images", authenticateToken, validateParams(idSchema), upload.single("image"), validateFile({ required: true }), validateImageContent, uploadProductImage);
router.delete("/:id/images/:imageId", authenticateToken, validateParams(imageIdSchema), deleteProductImage);
router.patch("/:id/images/:imageId/primary", authenticateToken, validateParams(imageIdSchema), setPrimaryImage);

export default router;
