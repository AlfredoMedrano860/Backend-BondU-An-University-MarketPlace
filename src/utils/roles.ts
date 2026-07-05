import { and, eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_roles } from '../db/schemas/UserRolesSchema';
import { user_role_types } from '../db/schemas/UserRoleTypesSchema';

/**
 * Le asigna el rol indicado a un usuario si todavia no lo tiene (idempotente).
 * No falla si el rol no existe en el catalogo (`user_role_types`).
 * @param userId - ID del usuario al que se le asigna el rol.
 * @param roleName - Nombre del rol a asignar (`"buyer"` o `"seller"`).
 */
export async function assignRoleIfMissing(userId: string, roleName: string) {
    const [roleType] = await db.select({ role_type_id: user_role_types.role_type_id }).from(user_role_types).where(eq(user_role_types.role_name, roleName));
    if (!roleType) return;

    const [existing] = await db.select({ role_id: user_roles.role_id }).from(user_roles).where(
        and(eq(user_roles.user_id, userId), eq(user_roles.role_type_id, roleType.role_type_id))
    );
    if (existing) return;

    await db.insert(user_roles).values({ user_id: userId, role_type_id: roleType.role_type_id });
}
