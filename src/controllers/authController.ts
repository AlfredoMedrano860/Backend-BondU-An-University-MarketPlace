import type { Request, Response } from 'express';
import { db } from "../db/connection";
import { users } from "../db/schemas/UsersSchema";
import { user_stats } from "../db/schemas/UserStatsSchema";
import { user_preferences } from "../db/schemas/UserPreferencesSchema";
import { user_contact } from "../db/schemas/UserContactSchema";
import { hashPassword, comparePasswords } from "../utils/passwords";
import { generateToken, generateResetToken, verifyResetToken } from "../utils/jwt";
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

    await db.insert(user_stats).values({ user_id: user.id });
    await db.insert(user_preferences).values({ user_id: user.id, language: 'es', notifications: true });
    await db.insert(user_contact).values({ user_id: user.id });

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });
    return res.status(201).json({ message: 'User registered successfully', token, user });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));

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

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        university: user.university,
        career: user.career,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to login user' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    const resetToken = await generateResetToken(user.email);

    return res.status(200).json({
      message: 'Reset token generated successfully.',
      resetToken
    });

  } catch (error) {
    console.error('Error during forgot password:', error);
    res.status(500).json({ message: 'Failed to process password reset request.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    const payload = await verifyResetToken(resetToken);

    const [user] = await db.select().from(users).where(eq(users.email, payload.email));

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ password: hashedPassword, updated_at: new Date() })
      .where(eq(users.id, user.id));

    return res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error: any) {
    if (error?.code === 'ERR_JWT_EXPIRED') {
      return res.status(401).json({ message: 'Reset token has expired. Please request a new one.' });
    }
    if (error?.code?.startsWith('ERR_JWT') || error?.message === 'Invalid token type') {
      return res.status(401).json({ message: 'Reset token is invalid.' });
    }
    console.error('Error during reset password:', error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};
