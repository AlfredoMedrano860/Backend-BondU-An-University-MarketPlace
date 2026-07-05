import type { Response } from 'express';

/**
 * Traduce errores comunes de Postgres a respuestas HTTP apropiadas, en vez de
 * dejar que cualquier violacion de constraint termine como un 500 generico.
 * @param error - Error capturado en el `catch` de un controller
 * @param res - Response de Express sobre la que se escribe el status
 */
export function handleDbError(error: unknown, res: Response) {
    // Drizzle envuelve el error real de `pg` en `.cause`; el `.code` de Postgres vive ahi, no en el error externo.
    const pgError = error as { code?: string; cause?: { code?: string } } | null;
    const code = pgError?.code ?? pgError?.cause?.code;
    if (code === '23503') {
        return res.status(400).json({ message: 'Invalid reference: related record does not exist' });
    }
    if (code === '23505') {
        return res.status(409).json({ message: 'Duplicate value violates a unique constraint' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
}
