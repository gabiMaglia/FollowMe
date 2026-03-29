import axios from "axios";

import type { TokenStorage } from "@/src/ports/outbound/token-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/refresh",
];

type TokenRefresher = {
  onTokensRefreshed: (accessToken: string, refreshToken: string) => void;
  onRefreshFailed: () => void;
};

const createApiClient = (
  tokenStorage: TokenStorage,
  tokenRefresher: TokenRefresher,
) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });

  let isRefreshing = false;
  let failedQueue: {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }[] = [];

  const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      }
    });
    failedQueue = [];
  };

  client.interceptors.request.use(async (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some((ep) => config.url?.startsWith(ep));

    if (!isPublic) {
      const tokens = await tokenStorage.getTokens();
      if (tokens) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 403 &&
        error.response?.data?.message === "Onboarding not completed"
      ) {
        return Promise.reject(error);
      }

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      const isPublic = PUBLIC_ENDPOINTS.some((ep) =>
        originalRequest.url?.startsWith(ep),
      );
      if (isPublic) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await tokenStorage.getTokens();
        if (!tokens?.refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        const newAccessToken: string = data.accessToken;
        const newRefreshToken: string = data.refreshToken;

        await tokenStorage.saveTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        tokenRefresher.onTokensRefreshed(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clearTokens();
        tokenRefresher.onRefreshFailed();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return client;
};

export { API_BASE_URL, createApiClient };

