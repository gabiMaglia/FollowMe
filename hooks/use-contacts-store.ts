import { create } from "zustand";

import { createApiClient } from "@/src/adapters/api/api-client";
import { createContactsApiAdapter } from "@/src/adapters/api/contacts-api-adapter";
import { createSecureTokenStorage } from "@/src/adapters/storage/secure-token-storage";
import {
    createGetContactsUseCase,
    createGetIncomingRequestsUseCase,
    createGetSentRequestsUseCase,
} from "@/src/application/use-cases/get-contacts";
import {
    createAcceptContactRequestUseCase,
    createCancelContactRequestUseCase,
    createRejectContactRequestUseCase,
    createRemoveContactUseCase,
} from "@/src/application/use-cases/manage-contacts";
import { createSearchUsersUseCase } from "@/src/application/use-cases/search-users";
import { createSendContactRequestUseCase } from "@/src/application/use-cases/send-contact-request";
import type {
    Contact,
    PendingRequest,
    SearchResult,
} from "@/src/domain/entities/connection";

type ContactsState = {
  contacts: Contact[];
  sentRequests: PendingRequest[];
  incomingRequests: PendingRequest[];
  searchResults: SearchResult[];
  searchQuery: string;
  isDiscoverable: boolean;
  isLoadingContacts: boolean;
  isLoadingSearch: boolean;
  isLoadingAction: boolean;
  error: string | null;
};

type ContactsActions = {
  loadContacts: () => Promise<void>;
  loadSentRequests: () => Promise<void>;
  loadIncomingRequests: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  sendRequest: (targetUserId: string) => Promise<void>;
  cancelRequest: (userId: string) => Promise<void>;
  acceptRequest: (userId: string) => Promise<void>;
  rejectRequest: (userId: string) => Promise<void>;
  removeContact: (userId: string) => Promise<void>;
  toggleLocationSharing: (
    userId: string,
    isLocationShared: boolean,
  ) => Promise<void>;
  updateContactSettings: (
    userId: string,
    settings: { isVisible?: boolean; notificationsEnabled?: boolean },
  ) => Promise<void>;
  toggleDiscoverability: (isDiscoverable: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  clearError: () => void;
};

type ContactsStore = ContactsState & ContactsActions;

// --- Dependency wiring ---
const tokenStorage = createSecureTokenStorage();
const apiClient = createApiClient(tokenStorage, {
  onTokensRefreshed: () => {},
  onRefreshFailed: () => {},
});
const contactsRepository = createContactsApiAdapter(apiClient);

const searchUsersUseCase = createSearchUsersUseCase({ contactsRepository });
const sendContactRequestUseCase = createSendContactRequestUseCase({
  contactsRepository,
});
const getContactsUseCase = createGetContactsUseCase({ contactsRepository });
const getIncomingRequestsUseCase = createGetIncomingRequestsUseCase({
  contactsRepository,
});
const getSentRequestsUseCase = createGetSentRequestsUseCase({
  contactsRepository,
});
const acceptContactRequestUseCase = createAcceptContactRequestUseCase({
  contactsRepository,
});
const rejectContactRequestUseCase = createRejectContactRequestUseCase({
  contactsRepository,
});
const cancelContactRequestUseCase = createCancelContactRequestUseCase({
  contactsRepository,
});
const removeContactUseCase = createRemoveContactUseCase({
  contactsRepository,
});

// --- Store ---
const initialState: ContactsState = {
  contacts: [],
  sentRequests: [],
  incomingRequests: [],
  searchResults: [],
  searchQuery: "",
  isDiscoverable: true,
  isLoadingContacts: false,
  isLoadingSearch: false,
  isLoadingAction: false,
  error: null,
};

const useContactsStore = create<ContactsStore>((set, get) => ({
  ...initialState,

  loadContacts: async () => {
    set({ isLoadingContacts: true, error: null });
    try {
      const contacts = await getContactsUseCase.execute();
      set({ contacts, isLoadingContacts: false });
    } catch (error) {
      set({ isLoadingContacts: false, error: getErrorMessage(error) });
    }
  },

  loadSentRequests: async () => {
    try {
      const sentRequests = await getSentRequestsUseCase.execute();
      set({ sentRequests });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  loadIncomingRequests: async () => {
    try {
      const incomingRequests = await getIncomingRequestsUseCase.execute();
      set({ incomingRequests });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  searchUsers: async (query: string) => {
    if (query.trim().length < 2) {
      set({ searchResults: [], searchQuery: query });
      return;
    }
    set({ isLoadingSearch: true, searchQuery: query, error: null });
    try {
      const result = await searchUsersUseCase.execute({ q: query });
      // Only update if the query hasn't changed while loading
      if (get().searchQuery === query) {
        set({ searchResults: result.data, isLoadingSearch: false });
      }
    } catch (error) {
      set({ isLoadingSearch: false, error: getErrorMessage(error) });
    }
  },

  sendRequest: async (targetUserId: string) => {
    set({ isLoadingAction: true, error: null });
    try {
      const connection = await sendContactRequestUseCase.execute(targetUserId);
      // Update search results to reflect the new status
      set((state) => ({
        isLoadingAction: false,
        searchResults: state.searchResults.map((r) =>
          r.userId === targetUserId
            ? {
                ...r,
                connectionStatus:
                  connection.status === "ACCEPTED"
                    ? ("CONNECTED" as const)
                    : ("PENDING_SENT" as const),
              }
            : r,
        ),
      }));
      // Reload sent requests
      await get().loadSentRequests();
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  cancelRequest: async (userId: string) => {
    set({ isLoadingAction: true, error: null });
    try {
      await cancelContactRequestUseCase.execute(userId);
      set((state) => ({
        isLoadingAction: false,
        sentRequests: state.sentRequests.filter((r) => r.fromUserId !== userId),
        searchResults: state.searchResults.map((r) =>
          r.userId === userId ? { ...r, connectionStatus: "NONE" as const } : r,
        ),
      }));
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  acceptRequest: async (userId: string) => {
    set({ isLoadingAction: true, error: null });
    try {
      await acceptContactRequestUseCase.execute(userId);
      set((state) => ({
        isLoadingAction: false,
        incomingRequests: state.incomingRequests.filter(
          (r) => r.fromUserId !== userId,
        ),
      }));
      await get().loadContacts();
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  rejectRequest: async (userId: string) => {
    set({ isLoadingAction: true, error: null });
    try {
      await rejectContactRequestUseCase.execute(userId);
      set((state) => ({
        isLoadingAction: false,
        incomingRequests: state.incomingRequests.filter(
          (r) => r.fromUserId !== userId,
        ),
      }));
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  removeContact: async (userId: string) => {
    set({ isLoadingAction: true, error: null });
    try {
      await removeContactUseCase.execute(userId);
      set((state) => ({
        isLoadingAction: false,
        contacts: state.contacts.filter((c) => c.userId !== userId),
      }));
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  toggleLocationSharing: async (userId: string, isLocationShared: boolean) => {
    set({ isLoadingAction: true, error: null });
    try {
      await contactsRepository.toggleLocationSharing(userId, isLocationShared);
      set((state) => ({
        isLoadingAction: false,
        contacts: state.contacts.map((c) =>
          c.userId === userId ? { ...c, isLocationShared } : c,
        ),
      }));
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  updateContactSettings: async (
    userId: string,
    settings: { isVisible?: boolean; notificationsEnabled?: boolean },
  ) => {
    set({ isLoadingAction: true, error: null });
    try {
      await contactsRepository.updateContactSettings(userId, settings);
      set((state) => ({
        isLoadingAction: false,
        contacts: state.contacts.map((c) =>
          c.userId === userId ? { ...c, ...settings } : c,
        ),
      }));
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  toggleDiscoverability: async (isDiscoverable: boolean) => {
    set({ isLoadingAction: true, error: null });
    try {
      const result =
        await contactsRepository.toggleDiscoverability(isDiscoverable);
      set({ isLoadingAction: false, isDiscoverable: result.isDiscoverable });
    } catch (error) {
      set({ isLoadingAction: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  clearSearch: () => set({ searchResults: [], searchQuery: "" }),

  clearError: () => set({ error: null }),
}));

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export { useContactsStore };
