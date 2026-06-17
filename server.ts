import app from "./src/app";
import env from "./env";

import userRoutes from "./src/routes/UserRoutes";
import userRoleTypeRoutes from "./src/routes/UserRoleTypes";
import userRoleRoutes from "./src/routes/UserRoles";
import userPreferencesRoutes from "./src/routes/UserPreferences";
import userStatsRoutes from "./src/routes/UserStats";

import productRoutes from "./src/routes/Products";
import productCategoriesRoutes from "./src/routes/ProductCategories";
import productConditionsRoutes from "./src/routes/ProductConditions";
import productStatusRoutes from "./src/routes/ProductStatus";

import notificationRoutes from "./src/routes/Notifications";
import notificationTypeRoutes from "./src/routes/NotificationTypes";

import reviewRoutes from "./src/routes/Reviews";
import reviewAnswersRoutes from "./src/routes/ReviewsAnswers";

// Sub-rutas de usuarios antes del router principal para evitar conflicto con /:id
app.use("/api/users/role-types", userRoleTypeRoutes);
app.use("/api/users/roles", userRoleRoutes);
app.use("/api/users/preferences", userPreferencesRoutes);
app.use("/api/users/stats", userStatsRoutes);
app.use("/api/users", userRoutes);

// Sub-rutas de productos antes del router principal para evitar conflicto con /:id
app.use("/api/products/categories", productCategoriesRoutes);
app.use("/api/products/conditions", productConditionsRoutes);
app.use("/api/products/status", productStatusRoutes);
app.use("/api/products", productRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/notification-types", notificationTypeRoutes);

// Sub-ruta de respuestas antes del router principal de reseñas para evitar conflicto con /:id
app.use("/api/reviews/answers", reviewAnswersRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (_, res) => {
    res.json({
        message: "BondU API running",
    });
});

app.use((_, res) => {
    res.status(404).json({
        message: "Endpoint not found",
    });
});

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});
