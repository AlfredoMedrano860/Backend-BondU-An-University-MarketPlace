import app from "./src/app";
import env from "./env";

import authRoutes from "./src/routes/AuthRoutes";
import userRoutes from "./src/routes/UsersRoutes";
import userRoleTypeRoutes from "./src/routes/UserRoleTypesRoutes";
import userRoleRoutes from "./src/routes/UserRolesRoutes";
import userPreferencesRoutes from "./src/routes/UserPreferencesRoutes";
import userStatsRoutes from "./src/routes/UserStatsRoutes";
import userContactRoutes from "./src/routes/UserContactRoutes";

import productRoutes from "./src/routes/ProductsRoutes";
import productConditionsRoutes from "./src/routes/ProductConditionsRoutes";
import productStatusRoutes from "./src/routes/ProductStatusRoutes";

import notificationRoutes from "./src/routes/NotificationsRoutes";
import notificationTypeRoutes from "./src/routes/NotificationTypesRoutes";

import reviewRoutes from "./src/routes/ReviewsRoutes";
import reviewAnswersRoutes from "./src/routes/ReviewsAnswersRoutes";
import favoritesRoutes from "./src/routes/FavoritesRoutes";

app.use("/api/auth", authRoutes);

// Sub-rutas de usuarios antes del router principal para evitar conflicto con /:id
app.use("/api/users/role-types", userRoleTypeRoutes);
app.use("/api/users/roles", userRoleRoutes);
app.use("/api/users/preferences", userPreferencesRoutes);
app.use("/api/users/stats", userStatsRoutes);
app.use("/api/users/contact", userContactRoutes);
app.use("/api/users", userRoutes);

// Sub-rutas de productos antes del router principal para evitar conflicto con /:id
app.use("/api/products/conditions", productConditionsRoutes);
app.use("/api/products/status", productStatusRoutes);
app.use("/api/products", productRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/notification-types", notificationTypeRoutes);

// Sub-ruta de respuestas antes del router principal de reseñas para evitar conflicto con /:id
app.use("/api/reviews/answers", reviewAnswersRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/users/:id/favorites", favoritesRoutes);

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
