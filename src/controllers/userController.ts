import type { Request, Response } from 'express';
import { db } from "../db/connection";
import { users } from "../db/schemas/Users";
import { hashPassword, comparePasswords } from "../utils/passwords";
import { generateToken } from "../utils/jwt";
import { eq } from 'drizzle-orm';

/**
 * Registra un nuevo usuario en la base de datos.
 * Hashea la contrasena antes de persistirla y devuelve un JWT al completar.
 * @param req - Body: `username`, `email`, `password`, `avatar`, `phone`, `location`, `university`, `career`
 * @param res - 201 con el token JWT, o 500 en error
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, avatar, phone, location, university, career } = req.body;
    const hashedPassword = await hashPassword(password);
    const [user] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      avatar,
      phone,
      location,
      university,
      career
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      avatar: users.avatar,
      phone: users.phone,
      location: users.location,
      university: users.university,
      career: users.career
    });

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });
    return res.status(201).json({ message: 'User registered successfully', token });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
}

/**
 * Autentica a un usuario verificando sus credenciales contra la base de datos.
 * Devuelve un JWT y los datos publicos del usuario al autenticar con exito.
 * @param req - Body: `email`, `password`
 * @param res - 201 con token y datos del usuario, 401 si las credenciales son invalidas, o 500 en error
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = await generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    return res.status(201).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        university: user.university,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to login user' });
  }
}