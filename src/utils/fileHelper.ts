import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const uploadsDir = () => path.join(process.cwd(), 'uploads');

/**
 * Elimina un archivo del directorio `uploads/`.
 * @param filename - Nombre del archivo (sin ruta), tal como lo guarda multer
 * @returns `true` si el archivo existia y fue eliminado, `false` en caso contrario
 */
export const deleteFile = async (filename: string): Promise<boolean> => {
    try {
        if (!filename) return false;
        const filePath = path.join(uploadsDir(), filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error deleting file ${filename}:`, error);
        return false;
    }
};

/**
 * Genera un nombre único para un archivo conservando su extensión original.
 * @param originalName - Nombre original del archivo subido
 * @returns Nombre único con formato `uuid.ext`
 */
export const generateUniqueFilename = (originalName: string): string => {
    const ext = path.extname(originalName);
    return `${randomUUID()}${ext}`;
};

/**
 * Verifica si un archivo existe en el directorio `uploads/`.
 * @param filename - Nombre del archivo (sin ruta)
 */
export const fileExists = (filename: string): boolean => {
    if (!filename) return false;
    return fs.existsSync(path.join(uploadsDir(), filename));
};

/**
 * Retorna el tamaño en bytes de un archivo en `uploads/`.
 * @param filename - Nombre del archivo (sin ruta)
 * @returns Tamaño en bytes, o `0` si no existe
 */
export const getFileSize = (filename: string): number => {
    try {
        if (!filename) return 0;
        const filePath = path.join(uploadsDir(), filename);
        if (!fs.existsSync(filePath)) return 0;
        return fs.statSync(filePath).size;
    } catch {
        return 0;
    }
};

/**
 * Verifica si el archivo tiene una extensión de imagen válida.
 * @param filename - Nombre del archivo
 */
export const isValidImageExtension = (filename: string): boolean => {
    const valid = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return valid.includes(path.extname(filename).toLowerCase());
};
