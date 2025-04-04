export type GetFriendsParams = {
  userId: string
};

export type GetPendingFriendRequestsParams = {
  receiverId: string
};

export type CreateFriendRequestParams = {
  senderId: string
  email: string
};

export type AcceptFriendRequestParams = {
  id: string
  receiverId: string
};

export type RejectFriendRequestParams = {
  id: string
  receiverId: string
};
