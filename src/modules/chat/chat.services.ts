import Exception from "../../utils/baseException";
import { GetChatMessagesParams, SendChatMessageParams } from "./chat.interfaces";
import prisma from '../../prisma.client'

export const getChatMessages = async ({ senderId, receiverId }: GetChatMessagesParams) => {
  if (!senderId || !receiverId) 
    throw new Exception(422, "Invalid parameter.")
  
  return prisma.message.findMany({
    where: {
      chat: {
        AND: [
          { members: { some: { userId: Number(senderId) } } },
          { members: { some: { userId: Number(receiverId) } } }
        ]
      }
    }
  })
}

export const sendChatMessage = async ({ senderId, receiverId, content }: SendChatMessageParams) => {
  if (!senderId || !receiverId) 
    throw new Exception(422, "Invalid parameter.")

  senderId = Number(senderId)
  receiverId = Number(receiverId)

  const chat = await prisma.chat.findFirst({
    where: {
      AND: [
        { members: { some: { userId: senderId } } },
        { members: { some: { userId: receiverId } } }
      ]
    }
  })

  if (!chat)
    throw new Exception(400, 'Chat not found.')

  return await prisma.message.create({
    data: {
      senderId,
      chatId: chat.id,
      content
    }
  })
}