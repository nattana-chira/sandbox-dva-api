import { PrismaClient } from '@prisma/client';
import Exception from '../../utils/Exception';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CreateUserRequest {
  email: string;
  password: string;
  profilePic?: string;
}


export const createUser = async ({ email, password, profilePic }: CreateUserRequest) => {
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

  return user
}