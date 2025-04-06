import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Exception from '../../utils/exception';
import { Response } from 'express';
import { config } from '../../config';

const prisma = new PrismaClient();

type LoginParams = {
  email: string
  password: string
};

type RegisterUserParams = {
  firstName: string
  lastName: string
  email: string
  password: string
  profilePic?: string | null
};

export type AuthUser = {
  id: number
  email: string
  profilePic?: string
};

export const registerUser = async ({ firstName, lastName, email, password, profilePic }: RegisterUserParams) => {
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
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePic
    }
  })

  return user
}

export const authenticateUser = async ({ email, password }: LoginParams) => {
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
    config.JWT_SECRET,
    { expiresIn: '24h' }
  )

  return { user, token };
}

export function authUser(res: Response) {
  return res.locals.auth
}

export function authUserId(res: Response) {
  return res.locals.auth.userId
}