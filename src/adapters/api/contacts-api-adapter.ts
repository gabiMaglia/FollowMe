import type { AxiosInstance } from "axios";

import type {
    Connection,
    Contact,
    PaginatedSearchResult,
    PendingRequest,
} from "@/src/domain/entities/connection";
import { NetworkError } from "@/src/domain/errors/auth-errors";
import {
    ConnectionAlreadyExistsError,
    ConnectionBlockedError,
    ConnectionNotFoundError,
    SelfConnectionError,
} from "@/src/domain/errors/connection-errors";
import type {
    ContactsRepository,
    SearchUsersParams,
} from "@/src/ports/outbound/contacts-repository";

const isAxiosError = (
  error: unknown,
): error is {
  response?: { status: number; data?: { message?: string } };
  message: string;
} => typeof error === "object" && error !== null && "isAxiosError" in error;

const createContactsApiAdapter = (
  client: AxiosInstance,
): ContactsRepository => ({
  searchUsers: async (
    params: SearchUsersParams,
  ): Promise<PaginatedSearchResult> => {
    try {
      const { data } = await client.get("/users/search", { params });
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  sendRequest: async (targetUserId: string): Promise<Connection> => {
    try {
      const { data } = await client.post("/contacts/request", {
        targetUserId,
      });
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          const message = error.response.data?.message ?? "";
          if (message.toLowerCase().includes("block")) {
            throw new ConnectionBlockedError();
          }
          throw new ConnectionAlreadyExistsError();
        }
        if (error.response?.status === 400) {
          throw new SelfConnectionError();
        }
        if (!error.response) {
          throw new NetworkError();
        }
      }
      throw error;
    }
  },

  acceptRequest: async (userId: string): Promise<Connection> => {
    try {
      const { data } = await client.patch(`/contacts/accept/${userId}`);
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new ConnectionNotFoundError(userId);
      }
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  rejectRequest: async (userId: string): Promise<void> => {
    try {
      await client.patch(`/contacts/reject/${userId}`);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new ConnectionNotFoundError(userId);
      }
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  cancelRequest: async (userId: string): Promise<void> => {
    try {
      await client.delete(`/contacts/${userId}`);
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  getContacts: async (): Promise<Contact[]> => {
    try {
      const { data } = await client.get("/contacts");
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  getIncomingRequests: async (): Promise<PendingRequest[]> => {
    try {
      const { data } = await client.get("/contacts/requests/incoming");
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  getSentRequests: async (): Promise<PendingRequest[]> => {
    try {
      const { data } = await client.get("/contacts/requests/sent");
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  removeContact: async (userId: string): Promise<void> => {
    try {
      await client.delete(`/contacts/${userId}`);
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  toggleLocationSharing: async (
    userId: string,
    isLocationShared: boolean,
  ): Promise<Connection> => {
    try {
      const { data } = await client.patch(
        `/contacts/${userId}/location-sharing`,
        { isLocationShared },
      );
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  updateContactSettings: async (
    userId: string,
    settings: { isVisible?: boolean; notificationsEnabled?: boolean },
  ): Promise<Connection> => {
    try {
      const { data } = await client.patch(
        `/contacts/${userId}/settings`,
        settings,
      );
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  toggleDiscoverability: async (
    isDiscoverable: boolean,
  ): Promise<{ isDiscoverable: boolean }> => {
    try {
      const { data } = await client.patch("/users/discoverability", {
        isDiscoverable,
      });
      return data;
    } catch (error: unknown) {
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },
});

export { createContactsApiAdapter };
