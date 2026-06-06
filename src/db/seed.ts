/*import {db} from './connection';
import {users, vehicle_brands, vehicles_categories, vehicles_fuel_types, vehicles} from './schema';

const seed = async () => {
    // PROTECTION: Prevent seeding in production
    const appStage = process.env.APP_STAGE;
    
    if (appStage === 'production') {
        console.error('ERROR: Cannot run seed script in production environment!');
        console.error('Current APP_STAGE:', appStage);
        process.exit(1); // Exit with error code
    }

    // confirmation for staging/test environments
    console.log(`Running seed in ${appStage} environment...`);
    console.log('starting seed...');

    try{
        console.log('deleting existing data...');
        await db.delete(users).execute();
        await db.delete(vehicle_brands).execute();
        await db.delete(vehicles_categories).execute();
        await db.delete(vehicles_fuel_types).execute();
        await db.delete(vehicles).execute();
        console.log('inserting seed data...');
        // Insert seed data
        // Insert users (no ID needed)
const insertedUsers = await db.insert(users).values([
    { email: 'alice@example.com', username: 'alice_smith', password: 'password1', first_name: 'Alice', last_name: 'Smith' },
    { email: 'bob@example.com', username: 'bob_johnson', password: 'password2', first_name: 'Bob', last_name: 'Johnson'}
    ]).returning();

    // Insert brands and capture IDs
    const insertedBrands = await db.insert(vehicle_brands).values([
        { name: 'Toyota' },
        { name: 'Honda' }
    ]).returning();

    // Insert categories and capture IDs
    const insertedCategories = await db.insert(vehicles_categories).values([
        { name: 'Sedan' },
        { name: 'SUV' }
    ]).returning();

    // Insert fuel types and capture IDs
    const insertedFuelTypes = await db.insert(vehicles_fuel_types).values([
        { name: 'Gasoline' },
        { name: 'Electric' }
    ]).returning();

    // Now insert vehicles using the captured IDs
    await db.insert(vehicles).values([
    { 
        brand_id: insertedBrands[0].id,      // Toyota
        category_id: insertedCategories[0].id, // Sedan
        fuel_type_id: insertedFuelTypes[0].id,  // Gasoline
        model: 'Camry', 
        year: 2020, 
        description: 'A reliable sedan' 
    },
    { 
        brand_id: insertedBrands[0].id,      // Toyota
        category_id: insertedCategories[1].id, // SUV
        fuel_type_id: insertedFuelTypes[0].id,  // Gasoline
        model: 'RAV4', 
        year: 2020, 
        description: 'A spacious SUV' 
    },
    { 
        brand_id: insertedBrands[1].id,      // Honda
        category_id: insertedCategories[0].id, // Sedan
        fuel_type_id: insertedFuelTypes[0].id,  // Gasoline
        model: 'Civic', 
        year: 2020, 
        description: 'A compact car' 
    },
    { 
        brand_id: insertedBrands[1].id,      // Honda
        category_id: insertedCategories[1].id, // SUV
        fuel_type_id: insertedFuelTypes[0].id,  // Gasoline
        model: 'CR-V', 
        year: 2020, 
        description: 'A versatile SUV' 
    }
    ]).returning();

    console.log('Seed completed successfully!');
    
}catch(error){
        console.error('Error during seeding:', error);
        process.exit(1); // Exit with error code
    }
}

if(require.main === module){
    seed().then(() => {
        console.log('Seed script finished.');
        process.exit(0); // Exit with success code
    }).catch((error) => {
        console.error('Error running seed script:', error);
        process.exit(1); // Exit with error code
    });
}

export default seed;*/