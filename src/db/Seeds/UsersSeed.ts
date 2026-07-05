import { db } from "../connection";
import { users } from "../schemas/UsersSchema";
import { user_stats } from "../schemas/UserStatsSchema";
import { user_preferences } from "../schemas/UserPreferencesSchema";
import { user_roles } from "../schemas/UserRolesSchema";
import { user_role_types } from "../schemas/UserRoleTypesSchema";
import { review_answers } from "../schemas/ReviewsAnswersSchema";
import { reviews } from "../schemas/ReviewsSchema";
import { user_favorites } from "../schemas/FavoritesSchema";
import { product_images } from "../schemas/ProductImagesSchema";
import { products } from "../schemas/ProductsSchema";
import { user_contact } from "../schemas/UserContactSchema";
import { hashPassword } from "../../utils/passwords";

/**
 * Puebla la base de datos con los 4 vendedores de muestra definidos en
 * src/components/data/Seller.ts del frontend.
 * Solo debe ejecutarse en entornos de desarrollo o staging.
 */
async function seedUsers() {
    console.log("Seeding users...");

    // Limpiar en orden inverso de dependencias FK
    await db.delete(review_answers).execute();
    await db.delete(reviews).execute();
    await db.delete(user_favorites).execute();
    await db.delete(product_images).execute();
    await db.delete(products).execute();
    await db.delete(user_roles).execute();
    await db.delete(user_preferences).execute();
    await db.delete(user_contact).execute();
    await db.delete(user_stats).execute();
    await db.delete(user_role_types).execute();
    await db.delete(users).execute();

    const roles = await db
        .insert(user_role_types)
        .values([
            { role_name: "seller" },
            { role_name: "buyer" },
        ])
        .returning();

    const sellerRole = roles.find(r => r.role_name === "seller")!;
    const buyerRole  = roles.find(r => r.role_name === "buyer")!;

    const hashedPassword = await hashPassword("bondu1234");
    const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";
    const defaultAvatar = `${BASE_URL}/uploads/IconoPerfil.webp`;

    const createdUsers = await db
        .insert(users)
        .values([
            {
                username: "Alfredo Medrano",
                email: "mc.alfredomedra@gmail.com",
                password: hashedPassword,
                avatar: defaultAvatar,
                phone: "+506 8812-3456",
                location: "Esparza, Puntarenas",
                university: "UCR",
                career: "Ingeniería Informática",
            },
            {
                username: "Camila Rojas",
                email: "camila.rojas@ucr.ac.cr",
                password: hashedPassword,
                avatar: defaultAvatar,
                phone: "+506 7723-4567",
                location: "San José, Costa Rica",
                university: "UCR",
                career: "Comunicación",
            },
            {
                username: "Diego Herrera",
                email: "diego.herrera@tec.ac.cr",
                password: hashedPassword,
                avatar: defaultAvatar,
                phone: "+506 6634-5678",
                location: "Cartago, Costa Rica",
                university: "TEC",
                career: "Computación",
            },
            {
                username: "Valentina Cruz",
                email: "valentina.cruz@una.ac.cr",
                password: hashedPassword,
                avatar: defaultAvatar,
                phone: "+506 5545-6789",
                location: "Heredia, Costa Rica",
                university: "UNA",
                career: "Diseño",
            },
        ])
        .returning();

    // Estadísticas de muestra para los 4 usuarios sembrados arriba, en el mismo orden
    const sellerStats = [
        { rating_avg: "3.0", review_count: 50, sales_count: 40 }, // Alfredo
        { rating_avg: "4.5", review_count: 28, sales_count: 22 }, // Camila
        { rating_avg: "4.0", review_count: 15, sales_count: 11 }, // Diego
        { rating_avg: "5.0", review_count: 8,  sales_count: 7  }, // Valentina
    ];

    const contactData = [
        { bio: "Estudiante de Ingeniería en la UCR. Vendo apuntes, libros y accesorios tech.", instagram: "alfredo.ucr", telegram: "alfredo_ucr" },
        { bio: "Comunicadora apasionada. Ofrezco materiales de diseño y libros de comunicación.", instagram: "camila.rojas", telegram: "camila_rojas" },
        { bio: "Dev en el TEC. Vendo libros de computación y gadgets.", instagram: "diego.tec", telegram: "diego_tec" },
        { bio: "Diseñadora en la UNA. Especializada en materiales de arte y diseño.", instagram: "vale.una", telegram: "vale_una" },
    ];

    for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        const stats = sellerStats[i];

        await db.insert(user_stats).values({
            user_id: user.id,
            rating_avg: stats.rating_avg,
            review_count: stats.review_count,
            sales_count: stats.sales_count,
        });

        await db.insert(user_contact).values({
            user_id: user.id,
            bio: contactData[i].bio,
            instagram: contactData[i].instagram,
            telegram: contactData[i].telegram,
        });

        await db.insert(user_preferences).values({
            user_id: user.id,
            language: "es",
            notifications: true,
        });

        // Todos parten como compradores; estos 4 ya tienen productos, así que también son vendedores
        await db.insert(user_roles).values([
            { user_id: user.id, role_type_id: buyerRole.role_type_id },
            { user_id: user.id, role_type_id: sellerRole.role_type_id },
        ]);
    }

    console.log("Users seeded successfully");
}

if (require.main === module) {
    seedUsers()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

export default seedUsers;
