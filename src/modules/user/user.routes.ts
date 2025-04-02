import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createUser } from './user.service';

const prisma = new PrismaClient();

const router = Router();

router.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, profilePic } = req.body
    const user = await createUser({ email, password, profilePic })

    res.json({
      id: user.id,
      email: user.email,
      profilePic: user.profilePic
    })
  } catch (error) {
    next(error)
  }
});

export default router