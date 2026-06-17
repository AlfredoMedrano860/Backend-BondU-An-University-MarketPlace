import seedProducts from "./ProductsSeed";
import seedUsers from "./UsersSeed";
import seedNotifications from "./NotificationsSeed";
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
