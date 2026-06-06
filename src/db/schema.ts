/*import { pgTable, uuid, text, timestamp, integer} from "drizzle-orm/pg-core";

import {relations} from "drizzle-orm";

import {createInsertSchema, createSelectSchema} from "drizzle-zod";

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const vehicle_brands = pgTable('vehicle_brands', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const vehicles_categories = pgTable('vehicle_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const vehicles_fuel_types= pgTable('vehicle_fuel_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const vehicles = pgTable('vehicles', {
    id: uuid('id').primaryKey().defaultRandom(),
    brand_id: uuid('brand_id').notNull().references(() => vehicle_brands.id),
    category_id: uuid('category_id').notNull().references(() => vehicles_categories.id),
    fuel_type_id: uuid('fuel_type_id').notNull().references(() => vehicles_fuel_types.id),
    model: text('model').notNull(),
    year: integer('year').notNull(),
    description: text('description'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const brandsRelations = relations(vehicle_brands, ({ many }) => ({
    vehicles: many(vehicles)
}));

export const categoriesRelations = relations(vehicles_categories, ({many}) => ({
    vehicles: many(vehicles)
}));

export const fuelTypeRelations = relations(vehicles_fuel_types, ({many}) => ({
    vehicles: many(vehicles)
}));

export const vehiclesRelations = relations(vehicles, ({one}) => ({

    brand: one(vehicle_brands, {
        fields: [vehicles.brand_id],
        references: [vehicle_brands.id]
    }),

    category: one(vehicles_categories, {
        fields: [vehicles.category_id],
        references: [vehicles_categories.id]
    }),

    fuelType: one(vehicles_fuel_types, {
        fields: [vehicles.fuel_type_id],
        references: [vehicles_fuel_types.id]
    })

}));

// Infer types
export type User = typeof users.$inferSelect;
export type VehicleBrand = typeof vehicle_brands.$inferSelect;
export type VehicleCategory = typeof vehicles_categories.$inferSelect;
export type VehicleFuelType = typeof vehicles_fuel_types.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertBrandSchema = createInsertSchema(vehicle_brands);
export const insertCategorySchema = createInsertSchema(vehicles_categories);
export const insertFuelTypeSchema = createInsertSchema(vehicles_fuel_types);
export const insertVehicleSchema = createInsertSchema(vehicles);

export const selectUserSchema = createSelectSchema(users);
export const selectBrandSchema = createSelectSchema(vehicle_brands);
export const selectCategorySchema = createSelectSchema(vehicles_categories);
export const selectFuelTypeSchema = createSelectSchema(vehicles_fuel_types);
export const selectVehicleSchema = createSelectSchema(vehicles);*/