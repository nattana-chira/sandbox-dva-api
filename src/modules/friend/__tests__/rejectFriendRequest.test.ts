import { findPendingRequest, rejectFriendRequest } from '../friend.service';
import { PrismaClient } from '@prisma/client';
import Exception from '../../../utils/exception';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    friendRequest: {
      findFirst: jest.fn(),
      update: jest.fn()
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

describe('rejectFriendRequest', () => {
  it('should successfully reject a friend request', async () => {
    const mockPendingRequest = { id: 1, senderId: 2, receiverId: 3, status: 'PENDING' };
    const mockFriendRequest = { id: 1, status: 'rejected' }

    prisma.friendRequest.findFirst.mockResolvedValue(mockPendingRequest);
    // @ts-ignore
    // Mock the findPendingRequest function to resolve successfully
    findPendingRequest.mockResolvedValue({ id: 1, senderId: 2, receiverId: 3, status: 'pending' })

    // @ts-ignore
    // Mock the Prisma update method
    prisma.friendRequest.update.mockResolvedValue(mockFriendRequest)

    // Call the rejectFriendRequest function
    const result = await rejectFriendRequest({ id: 1, receiverId: 3 })

    // Verify that the friend request status was updated to 'REJECTED'
    expect(result).toEqual(mockFriendRequest);
    expect(prisma.friendRequest.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'rejected' },
    })
  })

  it('should throw an error if id or receiverId is missing', async () => {
    // @ts-ignore
    // Missing id
    await expect(rejectFriendRequest({ id: undefined, receiverId: 3 }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."))

    // @ts-ignore
    // Missing receiverId
    await expect(rejectFriendRequest({ id: 1, receiverId: undefined }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."))
  });

  it('should throw an error if findPendingRequest throws an exception', async () => {
    const mockError = new Exception(400, "Pending friend request not found.")
    prisma.friendRequest.findFirst.mockRejectedValue(mockError);
    // @ts-ignore
    // Mock findPendingRequest to throw an exception
    findPendingRequest.mockRejectedValue(mockError);

    await expect(rejectFriendRequest({ id: 1, receiverId: 3 }))
      .rejects
      .toThrowError(new Exception(400, 'Pending friend request not found.'));
  });
});
