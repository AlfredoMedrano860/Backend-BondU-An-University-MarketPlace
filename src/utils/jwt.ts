import {SignJWT, jwtVerify, JWTPayload as JoseJWTPayload} from 'jose'

import {createSecretKey} from 'crypto'

import env from '../../env'

export interface CustomJWTPayload extends JoseJWTPayload {
    id: string;
    email: string;
    username: string;
}

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

export const verifyToken = async (token: string): Promise<CustomJWTPayload> => {
    const secret = env.JWT_SECRET;
    const secretKey = createSecretKey(secret, 'utf-8');
    const { payload } = await jwtVerify(token, secretKey);
    return payload as CustomJWTPayload;
}