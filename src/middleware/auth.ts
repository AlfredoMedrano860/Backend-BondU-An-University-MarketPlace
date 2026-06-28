import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type CustomJWTPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
    user?: CustomJWTPayload;
}

/**
 * Middleware que verifica el JWT en el header `Authorization: Bearer <token>`.
 * Si el token es valido, adjunta el payload decodificado en `req.user`.
 * Responde 401 si no hay token y 403 si el token es invalido o expirado.
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        req.user = await verifyToken(token);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid token' });
    }
};
