import { Request, Response, NextFunction } from 'express';

import { z } from 'zod';

/**
 * Middleware que valida `req.body` contra un schema Zod.
 * Reemplaza `req.body` con los datos parseados (strip de campos extra).
 * @param schema - Schema Zod a usar para la validacion
 * @returns Middleware de Express; responde 400 con los errores si la validacion falla
 */
export const validateBody = (schema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: error.issues
                });
            }
            next(error);
        }
    }
}

/**
 * Middleware que valida `req.params` contra un schema Zod.
 * @param schema - Schema Zod a usar para la validacion
 * @returns Middleware de Express; responde 400 si los parametros de ruta son invalidos
 */
export const validateParams = (schema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: 'Invalid parameters',
                    errors: error.issues
                });
            }
            next(error);
        }
    }
}

/**
 * Middleware que valida `req.query` contra un schema Zod.
 * @param schema - Schema Zod a usar para la validacion
 * @returns Middleware de Express; responde 400 si los query params son invalidos
 */
export const validateQuery = (schema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: 'Invalid query parameters',
                    errors: error.issues
                });
            }
            next(error);
        }
    }
}