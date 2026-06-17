/** Punto de entrada unificado para todos los schemas. Usar este archivo para imports limpios en el resto del proyecto. */

export * from "./ProductSchemas/ProductSchemas";
export * from "./ProductSchemas/ProductCategories";
export * from "./ProductSchemas/ProductConditions";
export * from "./ProductSchemas/ProductStatus";
export * from "./ProductSchemas/RelationCategory";
export * from "./ProductSchemas/RelationCondition";
export * from "./ProductSchemas/RelationStatus";
export * from "./ProductSchemas/RelationBetween";

export * from "./NotificationSchemas/NotificatioSchemas";
export * from "./NotificationSchemas/NotificationsTypes";
export * from "./NotificationSchemas/RelationNotifications";

export * from "./UserSchemas/Users";
export * from "./UserSchemas/UserStats";
export * from "./UserSchemas/UserPreferences";
export * from "./UserSchemas/UserRoles";
export * from "./UserSchemas/UserRoleTypes";