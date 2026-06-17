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

const schemaTotal = {
    ...productSchema,
    ...notificationSchema,
    ...usersSchema,
    ...userStatsSchema,
    ...userPreferencesSchema,
    ...userRolesSchema,
    ...userRoleTypesSchema,
};

export const db = drizzle(createPool(), {
    schema: schemaTotal,
});

export default db;