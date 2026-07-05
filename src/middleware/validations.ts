import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

import { z } from 'zod';
import { detectImageType, deleteFile } from '../utils/fileHelper';

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

/**
 * Middleware que valida el archivo subido por multer (`req.file`).
 * @param options.required - Si es true, responde 400 cuando no hay archivo
 * @param options.maxSize - Tamano maximo en bytes (opcional)
 */
export const validateFile = (options: { required?: boolean; maxSize?: number } = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { required = false, maxSize } = options;

        if (required && !req.file) {
            return res.status(400).json({ message: 'File is required', errors: ['No file was uploaded'] });
        }

        if (!req.file) return next();

        if (maxSize && req.file.size > maxSize) {
            const maxMB = (maxSize / (1024 * 1024)).toFixed(2);
            const fileMB = (req.file.size / (1024 * 1024)).toFixed(2);
            return res.status(400).json({
                message: 'File size exceeds maximum allowed size',
                errors: [`File size (${fileMB}MB) exceeds maximum (${maxMB}MB)`],
            });
        }

        next();
    };
};

/**
 * Middleware que valida el CONTENIDO real del archivo subido (firma binaria),
 * en vez de confiar en el `Content-Type` declarado por el cliente (fácilmente falsificable).
 * Si el archivo no es una imagen soportada, lo borra del disco y responde 400.
 * Si la extensión con la que multer lo guardó no coincide con el tipo real detectado,
 * renombra el archivo en disco para que se sirva con el `Content-Type` correcto.
 * Debe ejecutarse después de `upload.single(...)` y `validateFile`.
 */
export const validateImageContent = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const realExt = detectImageType(req.file.path);
    if (!realExt) {
        await deleteFile(req.file.filename);
        return res.status(400).json({ message: 'El archivo no es una imagen válida (JPEG, PNG, GIF o WebP).' });
    }

    const currentExt = path.extname(req.file.filename).toLowerCase();
    if (currentExt !== realExt) {
        const newFilename = `${path.basename(req.file.filename, path.extname(req.file.filename))}${realExt}`;
        const newPath = path.join(path.dirname(req.file.path), newFilename);
        fs.renameSync(req.file.path, newPath);
        req.file.filename = newFilename;
        req.file.path = newPath;
    }

    next();
};