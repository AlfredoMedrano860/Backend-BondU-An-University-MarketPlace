import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

const app = express();

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    morgan("dev", {
        skip: () => process.env.NODE_ENV === "test",
    })
);

export default app;