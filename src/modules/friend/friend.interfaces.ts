export type GetFriendsParams = {
  userId: string | number
};

export type GetPendingFriendRequestsParams = {
  receiverId: string | number
};

export type CreateFriendRequestParams = {
  senderId: string | number
  email: string
};

export type AcceptFriendRequestParams = {
  id: string | number
  receiverId: string | number
};

export type RejectFriendRequestParams = {
  id: string | number
  receiverId: string | number
};
