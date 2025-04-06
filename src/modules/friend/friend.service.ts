import Exception from "../../utils/exception";
import { AcceptFriendRequestParams, CreateFriendRequestParams, GetFriendsParams, GetPendingFriendRequestsParams, RejectFriendRequestParams } from "./friend.interfaces";
import prisma from '../../prisma.client'

const FRIEND_REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected"
}

export const getFriends = async ({ userId }: GetFriendsParams) => {
  if (!userId) 
    throw new Exception(422, "Invalid parameter.")

  return await prisma.user.findMany({
    where: {
      hasFriends: {
        some: { friendId: Number(userId) }
      }
    }
  })
}

export const getPendingFriendRequests = async ({ receiverId }: GetPendingFriendRequestsParams) => {
  if (!receiverId) 
    throw new Exception(422, "Invalid parameter.")

  return await prisma.friendRequest.findMany({
    where: {
      receiverId: Number(receiverId),
      status: FRIEND_REQUEST_STATUS.PENDING
    },
    include: {
      sender: true
    }
  })
}

export const sendFriendRequest = async ({ senderId, email }: CreateFriendRequestParams) => {
  if (!senderId || !email) 
    throw new Exception(422, "Invalid parameter.")

  senderId = Number(senderId)

  // Check if user exists by email
  const user = await prisma.user.findFirst({
    where: { email }
  })

  if (!user) 
    throw new Exception(400, "User not found.")

  // Check if user add self as friend
  if (user.id === senderId)
    throw new Exception(400, "Cannot add self as friend.")

  // Check if request is duplicated
  const duplicatedRequest = await prisma.friendRequest.findFirst({
    where: { 
      OR: [
        { senderId: senderId, receiverId: user.id },
        { senderId: user.id, receiverId: senderId }
      ],
      status: FRIEND_REQUEST_STATUS.PENDING
    }
  })

  if (duplicatedRequest) 
    throw new Exception(400, "Already sent pending friend request to this user.")

  // Check if be friend already
  const alreadyBeFriended = await prisma.userFriends.findFirst({
    where:  { 
      userId: senderId,
      friendId: user.id
    }
  })

  if (alreadyBeFriended) 
    throw new Exception(400, "This user is already in your friend list.")

  const friendRequest = await prisma.friendRequest.create({
    data: {
      senderId: senderId,
      receiverId: user.id,
      status: FRIEND_REQUEST_STATUS.PENDING
    }
  })

  return friendRequest
}

export const acceptFriendRequest = async ({ id, receiverId }: AcceptFriendRequestParams) => {
  if (!id || !receiverId) 
    throw new Exception(422, "Invalid parameter.")

  const pendingFriendRequest = await findPendingRequest({ id, receiverId })
  const { senderId } = pendingFriendRequest
  receiverId = Number(receiverId)

  return await prisma.$transaction(async (tx) => {
    // Mark friend request as accepted
    const friendRequest = await tx.friendRequest.update({
      where: {
        id: Number(id)
      },
      data: {
        status: FRIEND_REQUEST_STATUS.ACCEPTED
      }
    })

    // Mark both users as friends
    await tx.userFriends.createMany({
      data: [
        { userId: senderId, friendId: receiverId },
        { userId: receiverId, friendId: senderId }
      ]
    })

    // Create 1 on 1 chat
    const chat = await tx.chat.create({})
    await tx.chatMember.createMany({
      data: [
        { userId: senderId, chatId: chat.id },
        { userId: receiverId, chatId: chat.id }
      ]
    })

    return friendRequest
  })
}

export const rejectFriendRequest = async ({ id, receiverId }: RejectFriendRequestParams) => {
  if (!id || !receiverId)
    throw new Exception(422, "Invalid parameter.")

  await findPendingRequest({ id, receiverId })

  const friendRequest = await prisma.friendRequest.update({
    where: { id: Number(id) },
    data: {
      status: FRIEND_REQUEST_STATUS.REJECTED
    }
  })

  return friendRequest
}

export const findPendingRequest = async (
  { id, receiverId }: 
  { id: string | number, receiverId: string | number }
) => {
  const pendingFriendRequest = await prisma.friendRequest.findFirst({
    where: { 
      id: Number(id),
      receiverId: Number(receiverId),
      status: FRIEND_REQUEST_STATUS.PENDING
    }
  })

  if (!pendingFriendRequest) 
    throw new Exception(400, "Pending friend request not found.")

  return pendingFriendRequest
}