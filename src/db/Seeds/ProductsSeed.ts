import { db } from '../connection';
import { products } from "../schemas/ProductsSchema";
import { product_categories, products_categories } from "../schemas/ProductCategoriesSchema";
import { product_conditions } from "../schemas/ProductConditionsSchema";
import { product_status } from "../schemas/ProductStatusSchema";
import { product_images } from "../schemas/ProductImagesSchema";

/**
 * Puebla la base de datos con productos, categorias, condiciones, estados e imagenes de prueba.
 * Bloqueado en produccion mediante la variable de entorno `APP_STAGE`.
 */
const seed = async () => {
  const appStage = process.env.APP_STAGE;

  if (appStage === 'production') {
    console.error('ERROR: Cannot run seed script in production environment!');
    console.error('Current APP_STAGE:', appStage);
    process.exit(1);
  }

  console.log(`Running seed in ${appStage} environment...`);
  console.log('starting seed...');

  try {
    console.log('deleting existing data...');

    await db.delete(product_images).execute();
    await db.delete(products_categories).execute();
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
            condition_id: insertedConditions[0].condition_id,
            status_id: insertedStatus[0].status_id,
          },
          {
            name: "Mechanical Keyboard",
            description: "RGB keyboard",
            price: 120,
            condition_id: insertedConditions[1].condition_id,
            status_id: insertedStatus[0].status_id,
          },
        ])
        .returning();

    await db.insert(products_categories)
      .values([
        {
          product_id: insertedProducts[0].product_id,
          category_id: insertedCategories[0].category_id,
        },
        {
          product_id: insertedProducts[0].product_id,
          category_id: insertedCategories[1].category_id,
        },
        {
          product_id: insertedProducts[1].product_id,
          category_id: insertedCategories[2].category_id,
        },
      ]);

    await db.insert(product_images)
      .values([
        {
          product_id: insertedProducts[0].product_id,
          url: "https://placehold.co/800x600?text=Gaming+Laptop+1",
          is_primary: true,
        },
        {
          product_id: insertedProducts[0].product_id,
          url: "https://placehold.co/800x600?text=Gaming+Laptop+2",
          is_primary: false,
        },
        {
          product_id: insertedProducts[0].product_id,
          url: "https://placehold.co/800x600?text=Gaming+Laptop+3",
          is_primary: false,
        },
        {
          product_id: insertedProducts[1].product_id,
          url: "https://placehold.co/800x600?text=Keyboard+1",
          is_primary: true,
        },
        {
          product_id: insertedProducts[1].product_id,
          url: "https://placehold.co/800x600?text=Keyboard+2",
          is_primary: false,
        },
      ]);

    console.log("Products seed completed successfully!");

  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed().then(() => {
    console.log('Seed script finished.');
    process.exit(0);
  }).catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  });
}

export default seed;
