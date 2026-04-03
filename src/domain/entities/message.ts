const MessageSender = {
  Me: "ME",
  Contact: "CONTACT",
} as const;

type MessageSenderValue = (typeof MessageSender)[keyof typeof MessageSender];

type ChatMessage = {
  id: string;
  sender: MessageSenderValue;
  text: string;
  createdAt: number;
};

type Conversation = {
  contactId: string;
  displayName: string;
  messages: ChatMessage[];
  updatedAt: number;
};

export { MessageSender };
export type { ChatMessage, Conversation, MessageSenderValue };

