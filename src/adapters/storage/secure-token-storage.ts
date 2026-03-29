import * as SecureStore from "expo-secure-store";

import type { AuthTokens } from "@/src/domain/entities/auth-tokens";
import type { User } from "@/src/domain/entities/user";
import type { TokenStorage } from "@/src/ports/outbound/token-storage";

const ACCESS_TOKEN_KEY = "followme_access_token";
const REFRESH_TOKEN_KEY = "followme_refresh_token";
const USER_KEY = "followme_user";

const createSecureTokenStorage = (): TokenStorage => ({
  getTokens: async () => {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },

  saveTokens: async (tokens: AuthTokens) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },

  getUser: async () => {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  saveUser: async (user: User) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  clearUser: async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
  },
});

export { createSecureTokenStorage };

