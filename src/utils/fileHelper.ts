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

/**
 * Detecta el tipo real de una imagen leyendo su firma binaria (magic numbers),
 * en vez de confiar en el `Content-Type` o la extensión declarados por el cliente.
 * @param filePath - Ruta absoluta del archivo ya guardado en disco
 * @returns La extensión real (`.jpg`, `.png`, `.gif`, `.webp`) o `null` si no es una imagen soportada
 */
export const detectImageType = (filePath: string): string | null => {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg';
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
    if (buffer.subarray(0, 4).toString('ascii') === 'GIF8') return '.gif';
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return '.webp';
    return null;
};
