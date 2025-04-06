import { sendFriendRequest } from '../friend.service';
import { PrismaClient } from '@prisma/client';
import Exception from '../../../utils/exception';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    $transaction: jest.fn(),
    user: {
      findFirst: jest.fn()
    },
    friendRequest: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    userFriends: {
      findFirst: jest.fn(),
    },
    chat: {
      create: jest.fn()
    },
    chatMember: {
      createMany: jest.fn()
    }
  }
  return {
    PrismaClient: jest.fn(() => mPrismaClient)
  }
})

jest.mock('../friend.service', () => ({
  ...jest.requireActual('../friend.service'),  // Keep other functions as they are
  findPendingRequest: jest.fn(),  // Mock only `findPendingRequest`
}))

const prisma = new PrismaClient() as any

describe('sendFriendRequest', () => {
  it('should send a friend request successfully', async () => {
    const mockUser = { id: 2, email: 'friend@example.com' };
    const mockFriendRequest = {
      senderId: 1,
      receiverId: 2,
      status: 'PENDING'
    }

    prisma.user.findFirst.mockResolvedValue(mockUser);
    prisma.friendRequest.findFirst.mockResolvedValue(null); // No pending request
    prisma.userFriends.findFirst.mockResolvedValue(null); // Not friends yet
    prisma.friendRequest.create.mockResolvedValue(mockFriendRequest);

    const result = await sendFriendRequest({ senderId: 1, email: 'friend@example.com' });
    
    expect(result).toEqual(mockFriendRequest);
  });

  it('should throw error if email is invalid', async () => {
    prisma.user.findFirst.mockResolvedValue(null); // User not found

    await expect(sendFriendRequest({ senderId: 1, email: 'nonexistent@example.com' }))
      .rejects
      .toThrowError(new Exception(400, "User not found."));
  });

  it('should throw error if sender tries to add themselves as a friend', async () => {
    const mockUser = { id: 1, email: 'self@example.com' };

    prisma.user.findFirst.mockResolvedValue(mockUser);

    await expect(sendFriendRequest({ senderId: 1, email: 'self@example.com' }))
      .rejects
      .toThrowError(new Exception(400, "Cannot add self as friend."));
  });

  it('should throw error if there is an existing pending friend request', async () => {
    const mockUser = { id: 2, email: 'friend@example.com' };
    const mockPendingRequest = { senderId: 1, receiverId: 2, status: 'PENDING' };

    prisma.user.findFirst.mockResolvedValue(mockUser);
    prisma.friendRequest.findFirst.mockResolvedValue(mockPendingRequest); // Pending request exists

    await expect(sendFriendRequest({ senderId: 1, email: 'friend@example.com' }))
      .rejects
      .toThrowError(new Exception(400, "Already sent pending friend request to this user."));
  });

  it('should throw error if users are already friends', async () => {
    const mockUser = { id: 2, email: 'friend@example.com' }
    const mockUserFriend = { userId: 1, friendId: 2 }

    prisma.user.findFirst.mockResolvedValue(mockUser)
    prisma.friendRequest.findFirst.mockResolvedValue(null); // No pending request
    prisma.userFriends.findFirst.mockResolvedValue(mockUserFriend); // Already friends

    await expect(sendFriendRequest({ senderId: 1, email: 'friend@example.com' }))
      .rejects
      .toThrowError(new Exception(400, "This user is already in your friend list."));
  });

  it('should throw error if senderId or email is missing', async () => {
    // @ts-ignore
    await expect(sendFriendRequest({ senderId: undefined, email: 'friend@example.com' }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."));

    // @ts-ignore
    await expect(sendFriendRequest({ senderId: 1, email: undefined }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."));
  })
})