import { relations } from "drizzle-orm";

import { users } from "./UsersSchema";
import { user_stats } from "./UserStatsSchema";
import { user_preferences } from "./UserPreferencesSchema";
import { user_roles } from "./UserRolesSchema";
import { user_role_types } from "./UserRoleTypesSchema";

/** Relaciones de `users`: tiene muchas estadisticas, preferencias y roles */
export const user_relations = relations(users, ({ many }) => ({
    stats: many(user_stats),
    preferences: many(user_preferences),
    roles: many(user_roles),
}));

/** Relacion de `user_stats`: pertenece a un usuario */
export const user_stats_relations = relations(user_stats, ({ one }) => ({
    user: one(users, {
        fields: [user_stats.user_id],
        references: [users.id],
    }),
}));

/** Relacion de `user_preferences`: pertenece a un usuario */
export const user_preferences_relations = relations(user_preferences, ({ one }) => ({
    user: one(users, {
        fields: [user_preferences.user_id],
        references: [users.id],
    }),
}));

/** Relaciones de `user_roles`: pertenece a un usuario y a un tipo de rol */
export const user_roles_relations = relations(user_roles, ({ one }) => ({
    user: one(users, {
        fields: [user_roles.user_id],
        references: [users.id],
    }),
    role: one(user_role_types, {
        fields: [user_roles.role_type_id],
        references: [user_role_types.role_type_id],
    }),
}));

/** Relacion de `user_role_types`: tiene muchos roles asignados */
export const user_role_types_relations = relations(user_role_types, ({ many }) => ({
    roles: many(user_roles),
}));
