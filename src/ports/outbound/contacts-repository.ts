import type {
    Connection,
    Contact,
    PaginatedSearchResult,
    PendingRequest,
} from "@/src/domain/entities/connection";

type SearchUsersParams = {
  q?: string;
  page?: number;
  limit?: number;
};

type ContactsRepository = {
  searchUsers: (params: SearchUsersParams) => Promise<PaginatedSearchResult>;
  sendRequest: (targetUserId: string) => Promise<Connection>;
  acceptRequest: (userId: string) => Promise<Connection>;
  rejectRequest: (userId: string) => Promise<void>;
  cancelRequest: (userId: string) => Promise<void>;
  getContacts: () => Promise<Contact[]>;
  getIncomingRequests: () => Promise<PendingRequest[]>;
  getSentRequests: () => Promise<PendingRequest[]>;
  removeContact: (userId: string) => Promise<void>;
  toggleLocationSharing: (
    userId: string,
    isLocationShared: boolean,
  ) => Promise<Connection>;
  updateContactSettings: (
    userId: string,
    settings: { isVisible?: boolean; notificationsEnabled?: boolean },
  ) => Promise<Connection>;
  toggleDiscoverability: (
    isDiscoverable: boolean,
  ) => Promise<{ isDiscoverable: boolean }>;
};

export type { ContactsRepository, SearchUsersParams };
