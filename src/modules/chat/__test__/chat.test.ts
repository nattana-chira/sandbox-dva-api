import { getChatMessages } from '../chat.services';
import { PrismaClient } from '@prisma/client';
import Exception from '../../../utils/baseException';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    message: {
      findMany: jest.fn(),
    }
  }
  return {
    PrismaClient: jest.fn(() => mPrismaClient)
  }
})

const prisma = new PrismaClient() as any

describe('getChatMessages', () => {
  it('should return messages for valid senderId and receiverId', async () => {
    const mockMessages = [
      { id: 1, content: 'Hi' },
      { id: 2, content: 'Hello' }
    ];

    (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

    const result = await getChatMessages({ senderId: 1, receiverId: 2 });

    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: {
        chat: {
          AND: [
            { members: { some: { userId: 1 } } },
            { members: { some: { userId: 2 } } },
          ]
        }
      }
    });

    expect(result).toEqual(mockMessages);
  });

  it('should throw an error if senderId is missing', async () => {
    // @ts-ignore
    await expect(getChatMessages({ receiverId: 2 }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."));
  });

  it('should throw an error if receiverId is missing', async () => {
    // @ts-ignore
    await expect(getChatMessages({ senderId: 1 }))
      .rejects
      .toThrowError(new Exception(422, "Invalid parameter."));
  });
});