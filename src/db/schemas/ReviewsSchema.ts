import { pgTable, uuid, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "./UsersSchema";

/** Tabla de reseñas entre usuarios: un reviewer califica a un seller */
export const reviews = pgTable("reviews", {
    id: uuid("id").primaryKey().defaultRandom(),
    /** FK hacia `users`. Usuario que escribe la reseña */
    reviewer_id: uuid("reviewer_id").notNull().references(() => users.id),
    /** FK hacia `users`. Usuario vendedor que recibe la calificacion */
    seller_id: uuid("seller_id").notNull().references(() => users.id),
    /** Calificacion numerica del seller. Escala de 1 a 5 */
    rating: numeric("rating").notNull(),
    /** Comentario opcional que acompana la calificacion. Nullable */
    comment: text("comment"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `reviews` */
export type Review = typeof reviews.$inferSelect;

/** Schema Zod para insertar una reseña */
export const insert_review_schema = createInsertSchema(reviews);

/** Schema Zod para seleccionar una reseña */
export const select_review_schema = createSelectSchema(reviews);

/** Schema Zod para actualizar una reseña (todos los campos opcionales) */
export const update_review_schema = createInsertSchema(reviews).partial();
