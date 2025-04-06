import { getFriends, getPendingFriendRequests } from '../friend.service';
import { PrismaClient } from '@prisma/client';
import Exception from '../../../utils/exception';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    },
    friendRequest: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    userFriends: {
      findFirst: jest.fn(),
      createMany: jest.fn()
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

describe('getFriends', () => {
  it('should throw an error if userId is missing', async () => {
    // @ts-ignore
    await expect(getFriends({ userId: undefined }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."))
  });

  it('should return an empty list if no friends found', async () => {
    // Mocking the `findMany` method to return an empty array (no friends)
    prisma.user.findMany.mockResolvedValue([]);

    const response = await getFriends({ userId: '9999999999999' })

    expect(response).toEqual([]); // Expect an empty array as the result
  });

  it('should return friends list if friends exist', async () => {
    // Mocking `findMany` to return a list of friends
    const mockFriends = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
    ]
    prisma.user.findMany.mockResolvedValue(mockFriends)

    const response = await getFriends({ userId: '1' })

    expect(response).toEqual(mockFriends); // Expect the mock friends list as result
    expect(response.length).toBe(2); // Assert the number of friends
  });

  it('should handle errors from prisma correctly', async () => {
    // Mocking `findMany` to throw an error
    prisma.user.findMany.mockRejectedValue(new Error('Database error'));

    await expect(getFriends({ userId: '1' }))
      .rejects
      .toThrowError('Database error');
  });
});

describe('getPendingFriendRequests', () => {
  it('should throw an error if receiverId is missing', async () => {
    // @ts-ignore
    await expect(getPendingFriendRequests({ receiverId: undefined }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."))
  });

  it('should return an empty list if no pending friend requests are found', async () => {
    // @ts-ignore
    prisma.friendRequest.findMany.mockResolvedValue([])

    const response = await getPendingFriendRequests({ receiverId: '1' })

    expect(response).toEqual([]) // Expect an empty array as the result
  })

  it('should return pending friend requests if they exist', async () => {
    // @ts-ignore
    const mockPendingRequests = [
      { id: 1, senderId: 1, receiverId: 2, status: 'PENDING', sender: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' } },
      { id: 2, senderId: 2, receiverId: 1, status: 'PENDING', sender: { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' } }
    ]
    // @ts-ignore
    prisma.friendRequest.findMany.mockResolvedValue(mockPendingRequests)

    const response = await getPendingFriendRequests({ receiverId: '1' })

    expect(response).toEqual(mockPendingRequests); // Expect the mock pending requests list as result
    expect(response.length).toBe(2); // Assert the number of pending requests
  })

  it('should handle errors from prisma correctly', async () => {
    // @ts-ignore
    prisma.friendRequest.findMany.mockRejectedValue(new Error('Database error'));

    await expect(getPendingFriendRequests({ receiverId: '1' }))
      .rejects
      .toThrowError('Database error')
  })
})