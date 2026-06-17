import {SignJWT, jwtVerify, JWTPayload as JoseJWTPayload} from 'jose'

import {createSecretKey} from 'crypto'

import env from '../../env'

/** Extiende el payload estandar de JWT con los campos de identidad del usuario de BondU */
export interface CustomJWTPayload extends JoseJWTPayload {
    id: string;
    email: string;
    username: string;
}

/**
 * Genera un JWT firmado con HS256 que expira segun `env.JWT_EXPIRES_IN`.
 * @param payload - Datos del usuario a incluir en el token (`id`, `email`, `username`)
 * @returns Token JWT como string listo para enviar al cliente
 */
export const generateToken = async (payload: CustomJWTPayload) => {
    const secret = env.JWT_SECRET;
    const secretKey = createSecretKey(secret, 'utf-8');
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN)
        .sign(secretKey);

    return token;
}

/**
 * Verifica y decodifica un JWT. Lanza un error si el token es invalido o ha expirado.
 * @param token - JWT a verificar
 * @returns Payload decodificado con los datos del usuario
 */
export const verifyToken = async (token: string): Promise<CustomJWTPayload> => {
    const secret = env.JWT_SECRET;
    const secretKey = createSecretKey(secret, 'utf-8');
    const { payload } = await jwtVerify(token, secretKey);
    return payload as CustomJWTPayload;
}