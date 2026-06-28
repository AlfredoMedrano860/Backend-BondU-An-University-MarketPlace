import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user_contact } from '../db/schemas/UserContactSchema';

export const getUserContactById = async (req: Request, res: Response) => {
    try {
        const [data] = await db.select().from(user_contact).where(eq(user_contact.user_id, req.params.id as string));
        if (!data) return res.status(404).json({ message: 'Contact not found' });
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserContact = async (req: Request, res: Response) => {
    try {
        const [data] = await db
            .update(user_contact)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(user_contact.user_id, req.params.id as string))
            .returning();
        if (!data) return res.status(404).json({ message: 'Contact not found' });
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
