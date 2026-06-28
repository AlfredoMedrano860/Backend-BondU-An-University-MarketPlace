import seedUsers from "./UsersSeed";
import seedProducts from "./ProductsSeed";
import seedReviews from "./ReviewsSeed";
import seedNotifications from "./NotificationsSeed";

// Orden importante: usuarios primero, luego productos (que referencian seller_id), luego reseñas
const seed = async () => {
    await seedUsers();
    await seedProducts();
    await seedReviews();
    await seedNotifications();
};

seed()
    .then(() => {
        console.log("All seeds completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    });
