import type { AxiosInstance } from "axios";

import {
    AuthenticationError,
    EmailAlreadyExistsError,
    NetworkError,
    OnboardingAlreadyCompletedError,
} from "@/src/domain/errors/auth-errors";
import type {
    AuthRepository,
    AuthResponse,
    GoogleAuthParams,
    LoginParams,
    OnboardingParams,
    OnboardingResponse,
    RefreshResponse,
    RegisterParams,
    RegisterResponse,
} from "@/src/ports/outbound/auth-repository";

const createAuthApiAdapter = (client: AxiosInstance): AuthRepository => ({
  login: async (params: LoginParams): Promise<AuthResponse> => {
    try {
      const { data } = await client.post("/auth/login", params);
      return {
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          onboardingCompleted: data.user.onboardingCompleted,
        },
      };
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401) {
        throw new AuthenticationError();
      }
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  register: async (params: RegisterParams): Promise<RegisterResponse> => {
    try {
      const { data } = await client.post("/auth/register", params);
      return {
        message: data.message,
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          onboardingCompleted: data.user.onboardingCompleted,
        },
      };
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        throw new EmailAlreadyExistsError(params.email);
      }
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  loginWithGoogle: async (params: GoogleAuthParams): Promise<AuthResponse> => {
    try {
      const { data } = await client.post("/auth/google", params);
      return {
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          onboardingCompleted: data.user.onboardingCompleted,
        },
      };
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401) {
        throw new AuthenticationError("Google authentication failed");
      }
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  completeOnboarding: async (
    params: OnboardingParams,
    accessToken: string,
  ): Promise<OnboardingResponse> => {
    try {
      const { data } = await client.post("/users/onboarding", params, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        message: data.message,
        onboardingCompleted: data.onboardingCompleted,
        isMinor: data.isMinor,
      };
    } catch (error: unknown) {
      if (
        isAxiosError(error) &&
        error.response?.status === 400 &&
        error.response.data?.message === "Onboarding already completed"
      ) {
        throw new OnboardingAlreadyCompletedError();
      }
      if (isAxiosError(error) && !error.response) {
        throw new NetworkError();
      }
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await client.post("/auth/refresh", { refreshToken });
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  logout: async (refreshToken: string): Promise<void> => {
    await client.post("/auth/logout", { refreshToken });
  },

  logoutAll: async (accessToken: string): Promise<void> => {
    await client.post(
      "/auth/logout-all",
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  },
});

const isAxiosError = (
  error: unknown,
): error is {
  response?: { status: number; data?: { message?: string } };
  request?: unknown;
} => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true
  );
};

export { createAuthApiAdapter };
