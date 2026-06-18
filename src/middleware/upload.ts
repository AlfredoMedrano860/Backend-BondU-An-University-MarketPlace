import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${randomUUID()}${ext}`);
    },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error('Solo se permiten imagenes JPEG, PNG, GIF o WebP.') as any;
        err.code = 'INVALID_FILE_TYPE';
        cb(err, false);
    }
};

/**
 * Instancia de multer configurada para subir imagenes al directorio `uploads/`.
 * - Tipos permitidos: JPEG, PNG, GIF, WebP
 * - Tamano maximo: 5 MB
 * - Nombre de archivo: UUID + extension original
 */
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
