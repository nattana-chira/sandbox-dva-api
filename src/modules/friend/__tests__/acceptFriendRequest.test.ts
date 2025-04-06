import { acceptFriendRequest, findPendingRequest } from '../friend.service';
import { PrismaClient } from '@prisma/client';
import Exception from '../../../utils/exception';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    $transaction: jest.fn(),
    friendRequest: {
      findFirst: jest.fn(),
      update: jest.fn()
    },
    userFriends: {
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

describe('acceptFriendRequest', () => {
  it('should throw an error if id or receiverId is missing', async () => {
    // @ts-ignore
    await expect(acceptFriendRequest({ id: undefined, receiverId: 1 }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."));

    // @ts-ignore
    await expect(acceptFriendRequest({ id: 1, receiverId: undefined }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."));
  });

  it('should successfully accept a friend request and create friendships', async () => {
    const mockPendingRequest = { id: 1, senderId: 2, receiverId: 3, status: 'PENDING' };
    const mockFriendRequest = { id: 1, status: 'ACCEPTED' };
    const mockCreateManyResponse = { count: 2 }; // Assuming 2 friends added
    const mockChat = { id: 1 }; // Mock chat creation response
    const mockChatMemberResponse = { count: 2 }; // Mock chat member creation response

    prisma.friendRequest.findFirst.mockResolvedValue(mockPendingRequest);
    // @ts-ignore
    // Mock findPendingRequest to return the mockPendingRequest
    findPendingRequest.mockResolvedValue(mockPendingRequest);

    // @ts-ignore
    // Mock Prisma methods
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
    prisma.friendRequest.update.mockResolvedValue(mockFriendRequest);
    prisma.userFriends.createMany.mockResolvedValue(mockCreateManyResponse);
    prisma.chat.create.mockResolvedValue(mockChat);
    prisma.chatMember.createMany.mockResolvedValue(mockChatMemberResponse);

    const result = await acceptFriendRequest({ id: 1, receiverId: 3 });

    // Verify the results
    expect(result).toEqual(mockFriendRequest);
    expect(prisma.friendRequest.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'accepted' },
    });
    expect(prisma.userFriends.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 2, friendId: 3 },
        { userId: 3, friendId: 2 }
      ]
    })
    expect(prisma.chat.create).toHaveBeenCalled();
    expect(prisma.chatMember.createMany).toHaveBeenCalled();
  })

  it('should throw an error if findPendingRequest throws an exception', async () => {
    const mockError = new Exception(400, "Pending friend request not found.");
    prisma.friendRequest.findFirst.mockRejectedValue(mockError);
    // @ts-ignore
    findPendingRequest.mockRejectedValue(mockError);

    await expect(acceptFriendRequest({ id: 1, receiverId: 3 }))
      .rejects
      .toThrowError(mockError);
  })

  it('should handle Prisma transaction failures', async () => {
    const mockPendingRequest = { id: 1, senderId: 2, receiverId: 3, status: 'PENDING' };
    prisma.friendRequest.findFirst.mockResolvedValue(mockPendingRequest);
    // @ts-ignore
    findPendingRequest.mockResolvedValue(mockPendingRequest);

    // @ts-ignore
    // Simulate a failure in the transaction
    prisma.$transaction.mockImplementation(async (callback) => {
      throw new Error('Transaction failed');
    })

    await expect(acceptFriendRequest({ id: 1, receiverId: 3 }))
      .rejects
      .toThrowError('Transaction failed');
  })
})