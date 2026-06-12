import {drizzle} from "drizzle-orm/node-postgres";
import {Pool} from "pg";
import * as schema from "./ProductSchemas/ProductSchemas";
import * as schema2 from "./ProductSchemas/NotificatioSchemas";
import env from "../../env";

const createPool = ()=>{
    return new Pool({
        connectionString: env.DATABASE_URL,
        connectionTimeoutMillis: 10000,
        max: 1,
        ssl: {
            rejectUnauthorized: false
        }
        //idleTimeoutMillis: 0,
        //keepAlive: true,
        //keepAliveInitialDelayMillis: 10000
    });
}
const schemaTota={
    schema, 
    schema2};
export const db = drizzle(createPool(), { schemaTotal});
export default db;