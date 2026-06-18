import { Router } from "express";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validations";
import { insert_user_schema, update_user_schema } from "../db/schemas/UsersSchema";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/usersController";

const router = Router();

const idSchema = z.object({ id: z.uuid() });

router.get("/", getAllUsers);
router.get("/:id", validateParams(idSchema), getUserById);
router.post("/", validateBody(insert_user_schema), createUser);
router.put("/:id", validateParams(idSchema), validateBody(update_user_schema), updateUser);
router.delete("/:id", validateParams(idSchema), deleteUser);

export default router;
