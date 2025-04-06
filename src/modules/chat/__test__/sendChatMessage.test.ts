import { sendChatMessage } from '../chat.services';
import { PrismaClient } from '@prisma/client';
import Exception from '../../../utils/exception';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    chat: {
      findFirst: jest.fn()
    },
    message: {
      create: jest.fn()
    }
  }
  return {
    PrismaClient: jest.fn(() => mPrismaClient)
  }
})

const prisma = new PrismaClient() as any


describe('sendChatMessage', () => {
  it('should send a chat message if chat exists', async () => {
    const mockChat = { id: 123 };
    const mockMessage = { id: 1, chatId: 123, senderId: 1, content: 'Hello' };

    (prisma.chat.findFirst as jest.Mock).mockResolvedValue(mockChat);
    (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

    const result = await sendChatMessage({
      senderId: 1,
      receiverId: 2,
      content: 'Hello'
    })

    expect(prisma.chat.findFirst).toHaveBeenCalledWith({
      where: {
        AND: [
          { members: { some: { userId: 1 } } },
          { members: { some: { userId: 2 } } }
        ]
      }
    })

    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        senderId: 1,
        chatId: 123,
        content: 'Hello'
      }
    })

    expect(result).toEqual(mockMessage);
  })

  it('should throw if senderId is missing', async () => {
    // @ts-ignore
    await expect(sendChatMessage({ receiverId: 2, content: 'Hi' }))
      .rejects.toThrowError(new Exception(422, 'Invalid parameter.'))
  })

  it('should throw if receiverId is missing', async () => {
    // @ts-ignore
    await expect(sendChatMessage({ senderId: 1, content: 'Hi' }))
      .rejects.toThrowError(new Exception(422, 'Invalid parameter.'))
  })

  it('should throw if chat does not exist', async () => {
    (prisma.chat.findFirst as jest.Mock).mockResolvedValue(null)

    await expect(
      sendChatMessage({ senderId: 1, receiverId: 2, content: 'Yo' })
    ).rejects.toThrowError(new Exception(400, 'Chat not found.'))
  })
})