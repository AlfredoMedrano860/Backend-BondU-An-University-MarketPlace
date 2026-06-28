import { db } from '../connection';
import { products } from "../schemas/ProductsSchema";
import { product_categories, products_categories } from "../schemas/ProductCategoriesSchema";
import { product_conditions } from "../schemas/ProductConditionsSchema";
import { product_status } from "../schemas/ProductStatusSchema";
import { product_images } from "../schemas/ProductImagesSchema";
import { users } from "../schemas/UsersSchema";

/**
 * Puebla la base de datos con productos, categorías, condiciones, estados e imágenes reales de BondU.
 * Bloqueado en producción mediante la variable de entorno `APP_STAGE`.
 */
const seed = async () => {
  const appStage = process.env.APP_STAGE;

  if (appStage === 'production') {
    console.error('ERROR: Cannot run seed script in production environment!');
    process.exit(1);
  }

  console.log(`Running products seed in ${appStage ?? 'development'} environment...`);

  try {
    console.log('Deleting existing product data...');
    await db.delete(product_images).execute();
    await db.delete(products_categories).execute();
    await db.delete(products).execute();
    await db.delete(product_categories).execute();
    await db.delete(product_conditions).execute();
    await db.delete(product_status).execute();

    console.log('Inserting categories...');
    const insertedCategories = await db.insert(product_categories)
      .values([
        { name_category: "Electrónica" },
        { name_category: "Libros" },
        { name_category: "Accesorios" },
        { name_category: "Papelería" },
        { name_category: "Gaming" },
        { name_category: "Ropa y Mochilas" },
      ])
      .returning();

    console.log('Inserting conditions...');
    // Matches stateValues in src/components/data/Filters.ts: ["Nuevo", "Usado", "Detalle"]
    const insertedConditions = await db.insert(product_conditions)
      .values([
        { name_condition: "Nuevo" },
        { name_condition: "Usado" },
        { name_condition: "Detalle" },
      ])
      .returning();

    const condNuevo  = insertedConditions.find(c => c.name_condition === "Nuevo")!;
    const condUsado  = insertedConditions.find(c => c.name_condition === "Usado")!;

    console.log('Inserting status...');
    const insertedStatus = await db.insert(product_status)
      .values([
        { name_status: "Disponible" },
        { name_status: "Vendido" },
        { name_status: "Reservado" },
      ])
      .returning();

    const statusDisponible = insertedStatus.find(s => s.name_status === "Disponible")!;

    // We need seller IDs — fetch the first 4 users created by UsersSeed
    const existingSellers = await db.select({ id: users.id }).from(users).limit(4);

    if (existingSellers.length < 4) {
      console.warn('Not enough sellers found. Run UsersSeed first for full product data.');
    }

    const sellerId = (index: number) => existingSellers[index]?.id ?? null;

    console.log('Inserting products...');
    // Matches products array in src/components/data/Product.ts
    const insertedProducts = await db.insert(products)
      .values([
        {
          name: "Audífonos inalámbricos",
          description: "Audífonos inalámbricos negros con diseño moderno y acabado minimalista. Cuentan con almohadillas cómodas para uso prolongado y diadema ajustable para mejor adaptación.",
          price: 60,
          seller_id: sellerId(0),
          condition_id: condNuevo.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Cargador portátil",
          description: "Cargador portátil de 10 000 mAh compatible con USB-C y USB-A. Ideal para cargar el teléfono o laptop en clases sin necesidad de un tomacorriente.",
          price: 25,
          seller_id: sellerId(1),
          condition_id: condNuevo.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Cuaderno universitario",
          description: "Cuaderno universitario de 200 páginas con tapa dura, hojas rayadas y espiral lateral. Perfecto para apuntes de clase y organización de materias.",
          price: 8,
          seller_id: sellerId(2),
          condition_id: condNuevo.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Mochila universitaria",
          description: "Mochila resistente con compartimento para laptop de hasta 15 pulgadas, bolsillos organizadores y correas acolchadas. En buen estado, usada un semestre.",
          price: 35,
          seller_id: sellerId(3),
          condition_id: condUsado.condition_id,
          status_id: statusDisponible.status_id,
        },
      ])
      .returning();

    const catElectronica   = insertedCategories.find(c => c.name_category === "Electrónica")!;
    const catAccesorios    = insertedCategories.find(c => c.name_category === "Accesorios")!;
    const catPapeleria     = insertedCategories.find(c => c.name_category === "Papelería")!;
    const catRopaMochilas  = insertedCategories.find(c => c.name_category === "Ropa y Mochilas")!;

    console.log('Inserting product-category relationships...');
    await db.insert(products_categories).values([
      { product_id: insertedProducts[0].product_id, category_id: catElectronica.category_id },
      { product_id: insertedProducts[0].product_id, category_id: catAccesorios.category_id },
      { product_id: insertedProducts[1].product_id, category_id: catElectronica.category_id },
      { product_id: insertedProducts[2].product_id, category_id: catPapeleria.category_id },
      { product_id: insertedProducts[3].product_id, category_id: catRopaMochilas.category_id },
    ]);

    const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";

    console.log('Inserting product images...');
    await db.insert(product_images).values([
      // Audífonos: imágenes reales
      { product_id: insertedProducts[0].product_id, url: `${BASE_URL}/uploads/AudifonoProducto.png`,  is_primary: true  },
      { product_id: insertedProducts[0].product_id, url: `${BASE_URL}/uploads/AudifonosGallery1.png`, is_primary: false },
      { product_id: insertedProducts[0].product_id, url: `${BASE_URL}/uploads/AudifonosGallery2.png`, is_primary: false },
      { product_id: insertedProducts[0].product_id, url: `${BASE_URL}/uploads/AudifonosGallery3.png`, is_primary: false },
      // Cargador
      { product_id: insertedProducts[1].product_id, url: `${BASE_URL}/uploads/AudifonoProducto.png`,  is_primary: true  },
      { product_id: insertedProducts[1].product_id, url: `${BASE_URL}/uploads/AudifonosGallery1.png`, is_primary: false },
      { product_id: insertedProducts[1].product_id, url: `${BASE_URL}/uploads/AudifonosGallery2.png`, is_primary: false },
      { product_id: insertedProducts[1].product_id, url: `${BASE_URL}/uploads/AudifonosGallery3.png`, is_primary: false },
      // Cuaderno
      { product_id: insertedProducts[2].product_id, url: `${BASE_URL}/uploads/AudifonoProducto.png`,  is_primary: true  },
      { product_id: insertedProducts[2].product_id, url: `${BASE_URL}/uploads/AudifonosGallery1.png`, is_primary: false },
      { product_id: insertedProducts[2].product_id, url: `${BASE_URL}/uploads/AudifonosGallery2.png`, is_primary: false },
      { product_id: insertedProducts[2].product_id, url: `${BASE_URL}/uploads/AudifonosGallery3.png`, is_primary: false },
      // Mochila
      { product_id: insertedProducts[3].product_id, url: `${BASE_URL}/uploads/AudifonoProducto.png`,  is_primary: true  },
      { product_id: insertedProducts[3].product_id, url: `${BASE_URL}/uploads/AudifonosGallery1.png`, is_primary: false },
      { product_id: insertedProducts[3].product_id, url: `${BASE_URL}/uploads/AudifonosGallery2.png`, is_primary: false },
      { product_id: insertedProducts[3].product_id, url: `${BASE_URL}/uploads/AudifonosGallery3.png`, is_primary: false },
    ]);

    console.log('Products seed completed successfully!');
  } catch (error) {
    console.error('Error during products seeding:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default seed;
