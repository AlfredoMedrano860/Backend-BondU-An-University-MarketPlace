import { asc } from "drizzle-orm";
import { db } from '../connection';
import { products } from "../schemas/ProductsSchema";
import { product_conditions } from "../schemas/ProductConditionsSchema";
import { product_status } from "../schemas/ProductStatusSchema";
import { product_images } from "../schemas/ProductImagesSchema";
import { users } from "../schemas/UsersSchema";

/**
 * Puebla la base de datos con productos, condiciones, estados e imágenes reales de BondU.
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
    await db.delete(products).execute();
    await db.delete(product_conditions).execute();
    await db.delete(product_status).execute();

    console.log('Inserting conditions...');
    // Coincide con stateValues en src/components/data/Filters.ts: ["Nuevo", "Usado", "Detalle"]
    const insertedConditions = await db.insert(product_conditions)
      .values([
        { name_condition: "Nuevo" },
        { name_condition: "Usado" },
        { name_condition: "Detalle" },
      ])
      .returning();

    const condNuevo  = insertedConditions.find(c => c.name_condition === "Nuevo")!;
    const condUsado  = insertedConditions.find(c => c.name_condition === "Usado")!;
    const condDetalle = insertedConditions.find(c => c.name_condition === "Detalle")!;

    console.log('Inserting status...');
    const insertedStatus = await db.insert(product_status)
      .values([
        { name_status: "Disponible" },
        { name_status: "Vendido" },
      ])
      .returning();

    const statusDisponible = insertedStatus.find(s => s.name_status === "Disponible")!;

    // Necesitamos IDs de vendedores: se toman los primeros 4 usuarios creados por UsersSeed
    // (ordenados por fecha de creación para no tomar cuentas de prueba dejadas por pruebas manuales)
    const existingSellers = await db.select({ id: users.id }).from(users).orderBy(asc(users.created_at)).limit(4);

    if (existingSellers.length < 4) {
      console.warn('Not enough sellers found. Run UsersSeed first for full product data.');
    }

    const sellerId = (index: number) => existingSellers[index]?.id ?? null;

    console.log('Inserting products...');
    const insertedProducts = await db.insert(products)
      .values([
        {
          name: "Audífonos inalámbricos",
          description: "Audífonos inalámbricos negros con diseño moderno y acabado minimalista. Cuentan con almohadillas cómodas para uso prolongado y diadema ajustable para mejor adaptación. En buen estado, con poco uso.",
          price: 60,
          seller_id: sellerId(2),
          condition_id: condUsado.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Set de lápices de colores",
          description: "Set de 24 lápices de colores en organizador cilíndrico. Colores vibrantes ideales para trabajos de diseño, apuntes ilustrados o proyectos de arte.",
          price: 6,
          seller_id: sellerId(3),
          condition_id: condNuevo.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Laptop para estudio",
          description: "Laptop en buen estado, ideal para tareas, investigación y clases virtuales. Pantalla nítida, buena duración de batería y rendimiento fluido para uso académico.",
          price: 350,
          seller_id: sellerId(0),
          condition_id: condUsado.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Mouse inalámbrico",
          description: "Mouse inalámbrico blanco y negro, ergonómico y silencioso. Conexión estable vía USB. Con un pequeño detalle estético en la carcasa que no afecta su funcionamiento.",
          price: 12,
          seller_id: sellerId(1),
          condition_id: condDetalle.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Pendrive 32GB",
          description: "Memoria USB de 32GB con cuerpo metálico resistente y tapa protectora. Perfecta para respaldar trabajos, presentaciones y documentos de clase.",
          price: 8,
          seller_id: sellerId(2),
          condition_id: condNuevo.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Set de pinceles para pintura",
          description: "Set de pinceles de cerdas sintéticas con mango de madera, en distintos tamaños. Ideales para acrílico, acuarela o proyectos de arte. Con uso moderado, cerdas en buen estado.",
          price: 10,
          seller_id: sellerId(3),
          condition_id: condUsado.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Set de pinturas con paleta",
          description: "Set de pinturas de colores surtidos junto con paleta de mezcla. Algunos colores con uso, pero con suficiente pintura para varios proyectos de arte o diseño.",
          price: 15,
          seller_id: sellerId(0),
          condition_id: condDetalle.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Tableta gráfica",
          description: "Tableta gráfica con lápiz sensible a la presión, ideal para dibujo digital, edición e ilustración. Compatible con laptop y programas de diseño. Con uso, funcionando perfectamente.",
          price: 80,
          seller_id: sellerId(1),
          condition_id: condUsado.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Teclado inalámbrico",
          description: "Teclado inalámbrico compacto y silencioso, compatible con laptop y tablet. Ideal para escribir trabajos y tomar apuntes con mayor comodidad.",
          price: 20,
          seller_id: sellerId(2),
          condition_id: condNuevo.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Tijeras escolares",
          description: "Tijeras de tamaño estándar, filo preciso y mango ergonómico. Útiles para manualidades, proyectos y trabajos de clase.",
          price: 4,
          seller_id: sellerId(3),
          condition_id: condNuevo.condition_id,
          status_id: statusDisponible.status_id,
        },
        {
          name: "Cable USB",
          description: "Cable USB-A a Micro-USB, plano y resistente a enredos. Conector con un leve desgaste por uso, pero funciona sin problema para cargar y transferir datos.",
          price: 5,
          seller_id: sellerId(0),
          condition_id: condDetalle.condition_id,
          status_id: statusDisponible.status_id,
        },
      ])
      .returning();

    const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";

    /** Arma las 4 filas de product_images (1 principal + 3 de galería) para un producto. */
    const imagesFor = (productId: string, baseName: string, galleryCount = 3) => [
      { product_id: productId, url: `${BASE_URL}/uploads/${baseName}Producto.webp`, is_primary: true },
    ].concat(
      Array.from({ length: galleryCount }, (_, i) => ({
        product_id: productId,
        url: `${BASE_URL}/uploads/${baseName}Gallery${i + 1}.webp`,
        is_primary: false,
      }))
    );

    console.log('Inserting product images...');
    const noImages: ReturnType<typeof imagesFor> = [];
    await db.insert(product_images).values(noImages.concat(
      imagesFor(insertedProducts[0].product_id, "Audifonos"),
      imagesFor(insertedProducts[1].product_id, "Colores"),
      imagesFor(insertedProducts[2].product_id, "Laptop"),
      imagesFor(insertedProducts[3].product_id, "Mouse"),
      imagesFor(insertedProducts[4].product_id, "Pendrive"),
      imagesFor(insertedProducts[5].product_id, "Pinceles"),
      imagesFor(insertedProducts[6].product_id, "Pinturas"),
      // Tableta: no hay imagen de producto propia, se reutiliza la primera de galería
      [
        { product_id: insertedProducts[7].product_id, url: `${BASE_URL}/uploads/TabletaGallery1.webp`, is_primary: true },
        { product_id: insertedProducts[7].product_id, url: `${BASE_URL}/uploads/TabletaGallery2.webp`, is_primary: false },
        { product_id: insertedProducts[7].product_id, url: `${BASE_URL}/uploads/TabletaGallery3.webp`, is_primary: false },
      ],
      imagesFor(insertedProducts[8].product_id, "Teclado"),
      imagesFor(insertedProducts[9].product_id, "Tijeras"),
      imagesFor(insertedProducts[10].product_id, "USB")
    ));

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
