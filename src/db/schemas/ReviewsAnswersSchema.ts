import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { reviews } from "./ReviewsSchema";

/** Tabla de respuestas del seller a una reseña */
export const review_answers = pgTable("reviews_answers", {
    id: uuid("id").primaryKey().defaultRandom(),
    /** FK hacia `reviews`. Una reseña puede tener multiples respuestas */
    review_id: uuid("review_id").notNull().references(() => reviews.id),
    comment: text("comment").notNull(),
    /** Incluye timezone a diferencia de otros timestamps en el schema */
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Tipo inferido de la fila completa de `reviews_answers` */
export type ReviewAnswer = typeof review_answers.$inferSelect;

/** Schema Zod para insertar una respuesta a una reseña */
export const insert_review_answer_schema = createInsertSchema(review_answers);

/** Schema Zod para seleccionar una respuesta a una reseña */
export const select_review_answer_schema = createSelectSchema(review_answers);

/** Schema Zod para actualizar una respuesta (todos los campos opcionales) */
export const update_review_answer_schema = createInsertSchema(review_answers).partial();
