import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import Exception from '../../utils/exception';

const prisma = new PrismaClient();

type CreateUserParams = {
  email: string;
  password: string;
  profilePic?: string;
};

export const createUser = async ({ email, password, profilePic }: CreateUserParams) => {
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