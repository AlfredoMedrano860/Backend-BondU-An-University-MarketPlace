import { relations } from "drizzle-orm";

import { users } from "./Users";
import { reviews } from "./Reviews";
import { review_answers } from "./ReviewsAnswers";

/** Relaciones de `reviews`: pertenece a un reviewer y un seller (ambos usuarios), tiene muchas respuestas */
export const reviews_relations = relations(reviews, ({ one, many }) => ({
    reviewer: one(users, {
        fields: [reviews.reviewer_id],
        references: [users.id],
        relationName: "reviews_as_reviewer",
    }),
    seller: one(users, {
        fields: [reviews.seller_id],
        references: [users.id],
        relationName: "reviews_as_seller",
    }),
    answers: many(review_answers),
}));

/** Relaciones de `reviews_answers`: pertenece a una reseña */
export const review_answers_relations = relations(review_answers, ({ one }) => ({
    review: one(reviews, {
        fields: [review_answers.review_id],
        references: [reviews.id],
    }),
}));
