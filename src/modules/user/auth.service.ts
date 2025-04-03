import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Exception from '../../utils/exception';
import { Response } from 'express';

const prisma = new PrismaClient();

type LoginParams = {
  email: string
  password: string
};

export type AuthUser = {
  id: number
  email: string
  profilePic?: string
};

export async function authenticateUser({ email, password }: LoginParams) {
  if (!email || !password) 
    throw new Exception(422, "Email and password are required.")

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) 
    throw new Exception(401, 'Invalid email or password')

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) 
    throw new Exception(401, 'Invalid email or password')
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "",
    { expiresIn: '1h' }
  )

  return { user, token };
}

export function authUser(res: Response) {
  return res.locals.auth
}

export function authUserId(res: Response) {
  return res.locals.auth.userId
}