import { NextFunction, Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import Exception from '../../utils/Exception';

const prisma = new PrismaClient();

const router = Router();

router.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, profilePic } = req.body;

  try {
    if (!email || !password) 
      throw new Exception(422, "Email and password are required.")
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) 
      throw new Exception(422, "Email already in used.'")
    
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profilePic
      }
    })

    res.json({
      id: user.id,
      email: user.email,
      profilePic: user.profilePic
    })
  } catch (error) {
    console.error(error)
    next(error)
  }
});

export default router