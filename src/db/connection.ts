import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schemas/schema";
import env from "../../env";

const createPool = () => {
    return new Pool({
        connectionString: env.DATABASE_URL,
        connectionTimeoutMillis: 10000,
        max: 1,
        ssl: {
            rejectUnauthorized: false,
        },
    });
};

/** Instancia principal de la base de datos. Usar este objeto en todos los archivos del proyecto. */
export const db = drizzle(createPool(), { schema });

export default db;