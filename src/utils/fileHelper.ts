import fs from 'fs';
import path from 'path';

/**
 * Elimina un archivo del directorio `uploads/`.
 * @param filename - Nombre del archivo (sin ruta), tal como lo guarda multer
 * @returns `true` si el archivo existia y fue eliminado, `false` en caso contrario
 */
export const deleteFile = async (filename: string): Promise<boolean> => {
    try {
        if (!filename) return false;
        const filePath = path.join(process.cwd(), 'uploads', filename);
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
