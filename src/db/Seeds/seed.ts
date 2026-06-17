import seedProducts from "./ProductSeeds";
import seedUsers from "./UserSeed";
import seedNotifications from "./NotificationsSeeds";

const seed = async () => {
    await seedProducts();
    await seedUsers();
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
