import { db } from "../connection";
import { reviews } from "../schemas/Reviews";
import { review_answers } from "../schemas/ReviewsAnswers";
import { users } from "../schemas/Users";

/**
 * Puebla la base de datos con reseñas y respuestas de prueba.
 * Requiere que existan al menos 2 usuarios en la base de datos.
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

        const existingUsers = await db.select().from(users).limit(2);

        if (existingUsers.length < 2) {
            console.warn("Not enough users to seed reviews. Run user seed first.");
            return;
        }

        const [reviewer, seller] = existingUsers;

        const insertedReviews = await db
            .insert(reviews)
            .values([
                {
                    reviewer_id: reviewer.id,
                    seller_id: seller.id,
                    rating: "4.5",
                    comment: "Great seller, fast and reliable.",
                },
                {
                    reviewer_id: seller.id,
                    seller_id: reviewer.id,
                    rating: "5.0",
                    comment: "Excellent buyer, no issues at all.",
                },
            ])
            .returning();

        await db.insert(review_answers).values([
            {
                review_id: insertedReviews[0].id,
                comment: "Thank you! It was a pleasure doing business with you.",
            },
        ]);

        console.log("Reviews seeded successfully");
    } catch (error) {
        console.error("Error during reviews seeding:", error);
        process.exit(1);
    }
};

if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default seed;
