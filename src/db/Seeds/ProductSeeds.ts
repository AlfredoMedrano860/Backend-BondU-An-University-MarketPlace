import {db} from '../connection';
import {products, product_categories, product_conditions, product_status,
product_category_relation, product_conditions_relation, product_status_relation} from "../ProductSchemas/ProductSchemas";

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
        
    await db.delete(product_category_relation).execute();
    await db.delete(product_conditions_relation).execute();
    await db.delete(product_status_relation).execute();

        await db.delete(products).execute();
        await db.delete(product_categories).execute();
        await db.delete(product_conditions).execute();
        await db.delete(product_status).execute();
        console.log('inserting seed data...');

        const insertedCategories =
      await db.insert(product_categories)
      .values([
        { name_category: "Electronics" },
        { name_category: "Gaming" },
        { name_category: "Accessories" },
      ])
      .returning();

    const insertedConditions =
      await db.insert(product_conditions)
      .values([
        { name_condition: "New" },
        { name_condition: "Used" },
      ])
      .returning();

    const insertedStatus =
      await db.insert(product_status)
      .values([
        { name_status: "Available" },
        { name_status: "Out of Stock" },
      ])
      .returning();

    const insertedProducts =
      await db.insert(products)
      .values([
        {
          name: "Gaming Laptop",
          description: "RTX gaming laptop",
          price: 1500,
        },
        {
          name: "Mechanical Keyboard",
          description: "RGB keyboard",
          price: 120,
        },
      ])
      .returning();

    await db.insert(product_category_relation)
      .values([
        {
          product_id:
            insertedProducts[0].product_id,
          category_id:
            insertedCategories[0].category_id,
        },
        {
          product_id:
            insertedProducts[0].product_id,
          category_id:
            insertedCategories[1].category_id,
        },
        {
          product_id:
            insertedProducts[1].product_id,
          category_id:
            insertedCategories[2].category_id,
        },
      ]);

    await db.insert(product_conditions_relation)
      .values([
        {
          product_id:
            insertedProducts[0].product_id,
          conditions_id:
            insertedConditions[0].condition_id,
        },
        {
          product_id:
            insertedProducts[1].product_id,
          conditions_id:
            insertedConditions[1].condition_id,
        },
      ]);

    await db.insert(product_status_relation)
      .values([
        {
          product_id:
            insertedProducts[0].product_id,
          status_id:
            insertedStatus[0].status_id,
        },
        {
          product_id:
            insertedProducts[1].product_id,
          status_id:
            insertedStatus[1].status_id,
        },
      ]);

    console.log(
      "Products seed completed successfully!"
    );
  
  
  
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

export default seed;