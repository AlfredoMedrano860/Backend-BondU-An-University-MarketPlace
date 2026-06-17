import bcrypt from 'bcrypt';
import env from '../../env';

/**
 * Genera un hash bcrypt de la contrasena usando los rounds configurados en `env.BCRYPT_ROUNDS`.
 * @param password - Contrasena en texto plano
 * @returns Hash bcrypt listo para persistir en la base de datos
 */
export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

/**
 * Compara una contrasena en texto plano contra su hash bcrypt almacenado.
 * @param password - Contrasena en texto plano proporcionada por el usuario
 * @param hashedPassword - Hash bcrypt almacenado en la base de datos
 * @returns `true` si la contrasena es valida, `false` en caso contrario
 */
export const comparePasswords = async(password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};