export type GetChatMessagesParams = {
  senderId: string | number
  receiverId: string | number
};

export type SendChatMessageParams = {
  senderId: string | number
  receiverId: string | number
  content: string
};
