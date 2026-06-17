import type { Request, Response } from 'express';
import { db } from "../connection";
import { users } from "../UserSchemas/Users";
import { hashPassword, comparePasswords } from "../../utils/passwords";
import { generateToken } from "../../utils/jwt";
import { eq } from 'drizzle-orm';

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

export const login = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      // Status 401 = "Unauthorized" - authentication failed
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