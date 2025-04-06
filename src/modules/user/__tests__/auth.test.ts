import { registerUser, authenticateUser } from '../auth.service'; // Import your registerUser function
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
  };
});

// Mock bcrypt hash function
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')), // Correctly mock the hash function
  compare: jest.fn().mockResolvedValue(true), // or mockResolvedValue(false)
}));

// Mock jwt.sign function
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn() as any,
}));

const prisma = new PrismaClient() as any;
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  profilePic: null,
};

describe('registerUser', () => {
  it('should create a user successfully', async () => {
    // Mock the response from prisma.user.findUnique (simulating no existing user)
    prisma.user.findUnique.mockResolvedValue(null);

    // Mock the response from prisma.user.create (simulate successful creation)
    prisma.user.create.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      profilePic: null,
    });

    // Call the registerUser function
    const user = await registerUser(userData);

    // Assert that the user is created
    expect(user).toHaveProperty('id');
    expect(user.email).toBe('john.doe@example.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
  });

  it('should throw an error if email is already in use', async () => {
    // Mock the response from prisma.user.findUnique (simulate existing user)
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'john.doe@example.com',
      profilePic: null,
    });

    // Try registering with an already used email
    try {
      await registerUser(userData);
    } catch (error: any) {
      expect(error.message).toBe('Email already in used.');
    }
  });

  it('should throw an error if email or password is missing', async () => {
    const invalidUserData = { ...userData, email: '' };

    try {
      await registerUser(invalidUserData);
    } catch (error: any) {
      expect(error.message).toBe('Email and password are required.');
    }
  });
});

describe('authenticateUser', () => {
  it('should authenticate user successfully and return user and token', async () => {
    const mockUser = {
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed_password', // Mock hashed password
    };

    // Mock prisma.user.findUnique to return the mock user
    prisma.user.findUnique.mockResolvedValue(mockUser);

    // Mock bcrypt.compare to return true (password match)
    (bcrypt as any).compare.mockResolvedValue(true);

    // Mock jwt.sign to return a mock token
    (jwt as any).sign.mockReturnValue('mock_token');

    // Call authenticateUser function
    const response = await authenticateUser(userData);

    // Assert that the user data and token are returned
    expect(response.user).toHaveProperty('id');
    expect(response.user.email).toBe('john.doe@example.com');
    expect(response.token).toBe('mock_token');
  });

  it('should throw error if email is not provided', async () => {
    const invalidData = { ...userData, email: '' };

    try {
      await authenticateUser(invalidData);
    } catch (error: any) {
      expect(error.message).toBe('Email and password are required.');
    }
  });

  it('should throw error if password is not provided', async () => {
    const invalidData = { ...userData, password: '' };

    try {
      await authenticateUser(invalidData);
    } catch (error: any) {
      expect(error.message).toBe('Email and password are required.');
    }
  });

  it('should throw error if user does not exist', async () => {
    // Mock prisma.user.findUnique to return null (no user found)
    prisma.user.findUnique.mockResolvedValue(null);

    try {
      await authenticateUser(userData);
    } catch (error: any) {
      expect(error.message).toBe('Invalid email or password');
    }
  });

  it('should throw error if password is incorrect', async () => {
    const mockUser = {
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed_password',
    };

    // Mock prisma.user.findUnique to return the mock user
    prisma.user.findUnique.mockResolvedValue(mockUser);

    // Mock bcrypt.compare to return false (password does not match)
    (bcrypt as any).compare.mockResolvedValue(false);

    try {
      await authenticateUser(userData);
    } catch (error: any) {
      expect(error.message).toBe('Invalid email or password');
    }
  });
});
