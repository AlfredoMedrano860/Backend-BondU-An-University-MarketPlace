export default {
    //db connection
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!
    },
    //schema
    schema: "./src/db/schemas/schema.ts",
    //migrations
    out: "./migrations",
    //sql verbose logging
    verbose: true,
    //strict mode
    strict: true
};