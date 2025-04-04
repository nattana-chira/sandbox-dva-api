import { PrismaClient } from "@prisma/client";
import Exception from "../../utils/exception";
import { AcceptFriendRequestParams, CreateFriendRequestParams, GetFriendsParams, GetPendingFriendRequestsParams, RejectFriendRequestParams } from "./friend.interfaces";


const prisma = new PrismaClient();

const FRIEND_REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected"
}

// type FriendRequestStatus = (typeof FRIEND_REQUEST_STATUS)[keyof typeof FRIEND_REQUEST_STATUS];

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

  const user = await prisma.user.findFirst({
    where:  { 
      email
    }
  })

  if (!user) 
    throw new Exception(400, "User not found.")

  if (Number(user.id) === Number(senderId))
    throw new Exception(400, "Cannot add self as friend.")

  const pendingFriendRequest = await prisma.friendRequest.findFirst({
    where: { 
      OR: [
        { 
          senderId: Number(senderId),
          receiverId: Number(user.id)
        },
        { 
          senderId: Number(user.id),
          receiverId: Number(senderId)
        }
      ],
      status: FRIEND_REQUEST_STATUS.PENDING
    }
  })

  if (pendingFriendRequest) 
    throw new Exception(400, "Already sent pending friend request to this user.")

  const alreadyBeFriended = await prisma.userFriends.findFirst({
    where:  { 
      userId: Number(senderId),
      friendId: Number(user.id)
    }
  })

  if (alreadyBeFriended) 
    throw new Exception(400, "This user is already in your friend list.")

  const friendRequest = await prisma.friendRequest.create({
    data: {
      senderId: Number(senderId),
      receiverId: Number(user.id),
      status: FRIEND_REQUEST_STATUS.PENDING
    }
  })

  return friendRequest
}

export const acceptFriendRequest = async ({ id, receiverId }: AcceptFriendRequestParams) => {
  if (!id || !receiverId) 
    throw new Exception(422, "Invalid parameter.")

  const pendingFriendRequest = await findOrFailPendingRequest({ id, receiverId })

  return await prisma.$transaction(async (tx) => {
    const friendRequest = await tx.friendRequest.update({
      where: {
        id: Number(id)
      },
      data: {
        status: FRIEND_REQUEST_STATUS.ACCEPTED
      }
    })

    await tx.userFriends.create({
      data: {
        userId: pendingFriendRequest.senderId,
        friendId: pendingFriendRequest.receiverId
      }
    })

    await tx.userFriends.create({
      data: {
        userId: pendingFriendRequest.receiverId,
        friendId: pendingFriendRequest.senderId
      }
    })

    return friendRequest
  })
}

export const rejectFriendRequest = async ({ id, receiverId }: RejectFriendRequestParams) => {
  if (!id || !receiverId)
    throw new Exception(422, "Invalid parameter.")

  await findOrFailPendingRequest({ id, receiverId })

  const friendRequest = await prisma.friendRequest.update({
    where: {
      id: Number(id)
    },
    data: {
      status: FRIEND_REQUEST_STATUS.REJECTED
    }
  })

  return friendRequest
}

const findOrFailPendingRequest = async (
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