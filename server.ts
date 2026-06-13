import app from "./src/app";
import env from "./env";

import userRoutes from "./src/routes/UserRoutes/UserRoutes";

app.use("/api/users", userRoutes);

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