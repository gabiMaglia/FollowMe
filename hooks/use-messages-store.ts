import { create } from "zustand";

import type { Conversation } from "@/src/domain/entities/message";

type ConversationsByContactId = Record<string, Conversation>;

type MessagesState = {
  conversations: ConversationsByContactId;
};

type MessagesActions = {
  ensureConversation: (contactId: string, displayName: string) => void;
  sendMessage: (contactId: string, displayName: string, text: string) => void;
};

type MessagesStore = MessagesState & MessagesActions;

const createMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const useMessagesStore = create<MessagesStore>((set) => ({
  conversations: {},

  ensureConversation: (contactId, displayName) => {
    set((state) => {
      const existing = state.conversations[contactId];
      if (existing) {
        if (existing.displayName === displayName) {
          return state;
        }
        return {
          conversations: {
            ...state.conversations,
            [contactId]: {
              ...existing,
              displayName,
            },
          },
        };
      }

      return {
        conversations: {
          ...state.conversations,
          [contactId]: {
            contactId,
            displayName,
            messages: [],
            updatedAt: Date.now(),
          },
        },
      };
    });
  },

  sendMessage: (contactId, displayName, text) => {
    const messageText = text.trim();
    if (messageText.length === 0) {
      return;
    }

    set((state) => {
      const now = Date.now();
      const existing = state.conversations[contactId] ?? {
        contactId,
        displayName,
        messages: [],
        updatedAt: now,
      };

      const nextMessage = {
        id: createMessageId(),
        sender: "ME" as const,
        text: messageText,
        createdAt: now,
      };

      return {
        conversations: {
          ...state.conversations,
          [contactId]: {
            ...existing,
            displayName,
            updatedAt: now,
            messages: [...existing.messages, nextMessage],
          },
        },
      };
    });
  },
}));

export { useMessagesStore };
