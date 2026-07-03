import app from "./src/app";
import env from "./env";

import userRoutes from "./src/routes/UserRoutes/UserRoutes";
import authRoutes from "./src/routes/AuthRoutes/AuthRoutes";

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

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