import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as productSchema from "./ProductSchemas/ProductSchemas";
import * as notificationSchema from "./NotificationSchemas/NotificatioSchemas";

import * as usersSchema from "./UserSchemas/Users";
import * as userStatsSchema from "./UserSchemas/UserStats";
import * as userPreferencesSchema from "./UserSchemas/UserPreferences";
import * as userRolesSchema from "./UserSchemas/UserRoles";
import * as userRoleTypesSchema from "./UserSchemas/UserRoleTypes";

import env from "../../env";

/**
 * Crea un pool de conexiones PostgreSQL con SSL habilitado.
 * El limite de 1 conexion es adecuado para entornos serverless.
 */
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

/** Combinacion de todos los schemas para habilitar las queries relacionales de Drizzle */
const schemaTotal = {
    ...productSchema,
    ...notificationSchema,
    ...usersSchema,
    ...userStatsSchema,
    ...userPreferencesSchema,
    ...userRolesSchema,
    ...userRoleTypesSchema,
};

/** Instancia principal de la base de datos. Usar este objeto en todos los archivos del proyecto. */
export const db = drizzle(createPool(), {
    schema: schemaTotal,
});

export default db;