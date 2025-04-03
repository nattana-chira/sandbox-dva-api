import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Exception from '../../utils/exception';

const prisma = new PrismaClient();

type LoginRequest = {
  email: string;
  password: string;
};

export async function authenticateUser({ email, password }: LoginRequest) {
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