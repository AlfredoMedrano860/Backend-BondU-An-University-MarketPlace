import seedProducts from "./ProductSeeds";
import seedUsers from "./UserSeed";
import seedNotifications from "./NotificationsSeeds";
import seedReviews from "./ReviewsSeed";

const seed = async () => {
    await seedProducts();
    await seedUsers();
    await seedNotifications();
    await seedReviews();
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
