import { db } from "../connection";
import { reviews } from "../schemas/ReviewsSchema";
import { review_answers } from "../schemas/ReviewsAnswersSchema";
import { users } from "../schemas/UsersSchema";
import { user_stats } from "../schemas/UserStatsSchema";
import { eq } from "drizzle-orm";

/**
 * Puebla la base de datos con las reseñas definidas en
 * src/components/data/Review.ts del frontend.
 * Requiere que los 4 usuarios de UsersSeed existan.
 *
 * Mapa de reseñas del frontend (indexado por vendedor):
 *   Alfredo (index 0): recibe reseña de Camila (rating 3)
 *   Camila  (index 1): recibe reseñas de Diego (5), Alfredo (4), Valentina (5)
 *   Diego   (index 2): recibe reseña de Camila (4)
 *   Valentina (index 3): recibe reseñas de Diego (5), Alfredo (5)
 */
const seed = async () => {
    const appStage = process.env.APP_STAGE;

    if (appStage === "production") {
        console.error("ERROR: Cannot run seed script in production environment!");
        process.exit(1);
    }

    console.log("Seeding reviews...");

    try {
        await db.delete(review_answers).execute();
        await db.delete(reviews).execute();

        const existingUsers = await db.select().from(users).limit(4);

        if (existingUsers.length < 4) {
            console.warn("Not enough users to seed reviews. Run UsersSeed first.");
            return;
        }

        // Orden coincide con el orden insertado en UsersSeed:
        // [0] Alfredo, [1] Camila, [2] Diego, [3] Valentina
        const [alfredo, camila, diego, valentina] = existingUsers;

        const insertedReviews = await db
            .insert(reviews)
            .values([
                // Alfredo recibe reseña de Camila (rating 3)
                {
                    reviewer_id: camila.id,
                    seller_id: alfredo.id,
                    rating: "3",
                    comment: "Todo bien, aunque el envío tardó un poco más de lo esperado.",
                },
                // Camila recibe reseñas de Diego (5), Alfredo (4), Valentina (5)
                {
                    reviewer_id: diego.id,
                    seller_id: camila.id,
                    rating: "5",
                    comment: "Vendedora muy amable, el artículo llegó en excelente estado.",
                },
                {
                    reviewer_id: alfredo.id,
                    seller_id: camila.id,
                    rating: "4",
                    comment: "Buena experiencia, respondió rápido y coordinó bien la entrega.",
                },
                {
                    reviewer_id: valentina.id,
                    seller_id: camila.id,
                    rating: "5",
                    comment: "Todo perfecto, lo recomiendo sin dudar.",
                },
                // Diego recibe reseña de Camila (4)
                {
                    reviewer_id: camila.id,
                    seller_id: diego.id,
                    rating: "4",
                    comment: "Buen vendedor, el artículo estaba en buen estado.",
                },
                // Valentina recibe reseñas de Diego (5), Alfredo (5)
                {
                    reviewer_id: diego.id,
                    seller_id: valentina.id,
                    rating: "5",
                    comment: "Increíble vendedora, súper detallista con el empaque.",
                },
                {
                    reviewer_id: alfredo.id,
                    seller_id: valentina.id,
                    rating: "5",
                    comment: "Producto impecable y atención de primera.",
                },
            ])
            .returning();

        // Respuesta de Alfredo a la reseña de Camila
        await db.insert(review_answers).values([
            {
                review_id: insertedReviews[0].id,
                comment: "¡Gracias por tu reseña! Intentaré mejorar los tiempos de envío.",
            },
        ]);

        // Actualizar user_stats con los promedios reales (coincide con Seller.ts)
        const statsToUpdate = [
            { user: alfredo,   rating_avg: "3.0", review_count: 1 },
            { user: camila,    rating_avg: "4.7", review_count: 3 },
            { user: diego,     rating_avg: "4.0", review_count: 1 },
            { user: valentina, rating_avg: "5.0", review_count: 2 },
        ];

        for (const { user, rating_avg, review_count } of statsToUpdate) {
            await db
                .update(user_stats)
                .set({ rating_avg, review_count })
                .where(eq(user_stats.user_id, user.id));
        }

        console.log("Reviews seeded successfully");
    } catch (error) {
        console.error("Error during reviews seeding:", error);
        process.exit(1);
    }
};

if (require.main === module) {
    seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default seed;
