import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    morgan("dev", {
        skip: () => process.env.NODE_ENV === "test",
    })
);

export default app;