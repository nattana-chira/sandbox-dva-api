import { PrismaClient } from "@prisma/client";
import Exception from "../../utils/exception";

const prisma = new PrismaClient();

const FRIEND_REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected"
}

// type FriendRequestStatus = (typeof FRIEND_REQUEST_STATUS)[keyof typeof FRIEND_REQUEST_STATUS];

type GetFriendsParams = {
  userId: string
};

type CreateFriendRequestParams = {
  senderId: string
  receiverId: string
};

type AcceptFriendRequestParams = {
  id: string
  receiverId: string
};

type RejectFriendRequestParams = {
  id: string
  receiverId: string
};

export const getFriends = async ({ userId }: GetFriendsParams) => {
  if (!userId) 
    throw new Exception(422, "Invalid parameter.")

  const users = await prisma.user.findMany({
    where: {
      hasFriends: {
        some: { friendId: Number(userId) }
      },
    },
  })

  return users
}

export const sendFriendRequest = async ({ senderId, receiverId }: CreateFriendRequestParams) => {
  if (!senderId || !receiverId || Number(senderId) === Number(receiverId)) 
    throw new Exception(422, "Invalid parameter.")

  const pendingFriendRequest = await prisma.friendRequest.findFirst({
    where: { 
      OR: [
        { 
          senderId: Number(senderId),
          receiverId: Number(receiverId)
        },
        { 
          senderId: Number(receiverId),
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
      friendId: Number(receiverId)
    }
  })

  if (alreadyBeFriended) 
    throw new Exception(400, "This user is already in your friend list.")

  const friendRequest = await prisma.friendRequest.create({
    data: {
      senderId: Number(senderId),
      receiverId: Number(receiverId),
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