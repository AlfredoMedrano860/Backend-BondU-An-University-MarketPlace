import { db } from "../connection";

import { users } from "../schemas/Users";
import { user_stats } from "../schemas/UserStats";
import { user_preferences } from "../schemas/UserPreferences";
import { user_roles } from "../schemas/UserRoles";
import { user_role_types } from "../schemas/UserRoleTypes";

/**
 * Puebla la base de datos con usuarios de prueba, incluyendo sus stats, preferencias y roles.
 * Solo debe ejecutarse en entornos de desarrollo o staging.
 */
async function seedUsers() {

    console.log("Seeding users...");

    const roles = await db
        .insert(user_role_types)
        .values([
            { role_name: "seller" },
            { role_name: "buyer" },
            { role_name: "admin" }
        ])
        .returning();

    const sellerRole = roles.find(
        role => role.role_name === "seller"
    );

    if (!sellerRole) {
        throw new Error("Seller role not found");
    }

    const createdUsers = await db
        .insert(users)
        .values([
            {
                username: "Alfredo Medrano",
                email: "alfredo@bondu.com",
                password: "123456",
                avatar: "/avatars/alfredo.png",
                phone: "88888888",
                location: "San José",
                university: "UCR",
                career: "Ingeniería Informática"
            },
            {
                username: "Sophia Kane",
                email: "sophia@bondu.com",
                password: "123456",
                avatar: "/avatars/sophia.png",
                phone: "87777777",
                location: "Puntarenas",
                university: "UTN",
                career: "Ingeniería del Software"
            },
            {
                username: "Aaron Mayorga",
                email: "aaron@bondu.com",
                password: "123456",
                avatar: "/avatars/aaron.png",
                phone: "86666666",
                location: "Alajuela",
                university: "TEC",
                career: "Computación"
            },
            {
                username: "Jorge Miranda",
                email: "jorge@bondu.com",
                password: "123456",
                avatar: "/avatars/jorge.png",
                phone: "85555555",
                location: "Heredia",
                university: "UNA",
                career: "Sistemas"
            }
        ])
        .returning();

    for (const user of createdUsers) {

        await db.insert(user_stats).values({
            user_id: user.id,
            rating_avg: "5.0",
            review_count: 0,
            sales_count: 0
        });

        await db.insert(user_preferences).values({
            user_id: user.id,
            language: "es",
            notifications: true
        });

        await db.insert(user_roles).values({
            user_id: user.id,
            role_type_id: sellerRole.role_type_id
        });
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