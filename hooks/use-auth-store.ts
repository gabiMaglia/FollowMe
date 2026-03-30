import * as Location from "expo-location";
import { create } from "zustand";

import { createApiClient } from "@/src/adapters/api/api-client";
import { createAuthApiAdapter } from "@/src/adapters/api/auth-api-adapter";
import { createLocationApiAdapter } from "@/src/adapters/api/location-api-adapter";
import { createSecureTokenStorage } from "@/src/adapters/storage/secure-token-storage";
import { createCheckAuthUseCase } from "@/src/application/use-cases/check-auth";
import { createCompleteOnboardingUseCase } from "@/src/application/use-cases/complete-onboarding";
import { createLoginUseCase } from "@/src/application/use-cases/login";
import { createLoginWithGoogleUseCase } from "@/src/application/use-cases/login-with-google";
import {
    createLogoutAllUseCase,
    createLogoutUseCase,
} from "@/src/application/use-cases/logout";
import { createRegisterUseCase } from "@/src/application/use-cases/register";
import type { User } from "@/src/domain/entities/user";
import type { AuthRepository } from "@/src/ports/outbound/auth-repository";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    displayName: string,
    password: string,
  ) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  completeOnboarding: (dateOfBirth: string) => Promise<{ isMinor: boolean }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

type AuthStore = AuthState & AuthActions;

// --- Dependency wiring ---
const tokenStorage = createSecureTokenStorage();

let authRepository: AuthRepository;
let locationApi: ReturnType<typeof createLocationApiAdapter>;

const initializeAuthRepository = () => {
  const apiClient = createApiClient(tokenStorage, {
    onTokensRefreshed: () => {
      // Tokens already saved by the interceptor
    },
    onRefreshFailed: () => {
      useAuthStore.getState().reset();
    },
  });
  authRepository = createAuthApiAdapter(apiClient);
  locationApi = createLocationApiAdapter(apiClient);
};

initializeAuthRepository();

const loginUseCase = createLoginUseCase({
  authRepository: authRepository!,
  tokenStorage,
});
const registerUseCase = createRegisterUseCase({
  authRepository: authRepository!,
});
const loginWithGoogleUseCase = createLoginWithGoogleUseCase({
  authRepository: authRepository!,
  tokenStorage,
});
const completeOnboardingUseCase = createCompleteOnboardingUseCase({
  authRepository: authRepository!,
  tokenStorage,
});
const logoutUseCase = createLogoutUseCase({
  authRepository: authRepository!,
  tokenStorage,
});
const logoutAllUseCase = createLogoutAllUseCase({
  authRepository: authRepository!,
  tokenStorage,
});
const checkAuthUseCase = createCheckAuthUseCase({
  authRepository: authRepository!,
  tokenStorage,
});

// --- Location snapshot helper ---
const sendLocationSnapshot = async (): Promise<void> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    console.log("[LocationSnapshot] Permission status:", status);
    if (status !== "granted") return;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    console.log(
      "[LocationSnapshot] Got position:",
      position.coords.latitude,
      position.coords.longitude,
    );

    await locationApi.sendLocationUpdate({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    console.log("[LocationSnapshot] POST /location success");
  } catch (error) {
    console.warn("[LocationSnapshot] Failed:", error);
  }
};

// --- Store ---
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await loginUseCase.execute(email, password);
      await tokenStorage.saveUser(user);
      set({ user, isAuthenticated: true, isLoading: false });
      sendLocationSnapshot();
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  register: async (email, displayName, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await registerUseCase.execute(
        email,
        displayName,
        password,
      );
      // After register, auto-login to get tokens
      const loginResult = await loginUseCase.execute(email, password);
      const mergedUser = { ...user, ...loginResult.user };
      await tokenStorage.saveUser(mergedUser);
      set({
        user: mergedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      sendLocationSnapshot();
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await loginWithGoogleUseCase.execute(idToken);
      await tokenStorage.saveUser(user);
      set({ user, isAuthenticated: true, isLoading: false });
      sendLocationSnapshot();
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  completeOnboarding: async (dateOfBirth) => {
    set({ isLoading: true, error: null });
    try {
      const result = await completeOnboardingUseCase.execute(dateOfBirth);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, onboardingCompleted: true };
        await tokenStorage.saveUser(updatedUser);
      }
      set((state) => ({
        user: state.user ? { ...state.user, onboardingCompleted: true } : null,
        isLoading: false,
      }));
      sendLocationSnapshot();
      return { isMinor: result.isMinor };
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await sendLocationSnapshot();
      await logoutUseCase.execute();
    } finally {
      await tokenStorage.clearUser();
      set({ ...initialState, isLoading: false });
    }
  },

  logoutAll: async () => {
    set({ isLoading: true });
    try {
      await logoutAllUseCase.execute();
    } finally {
      await tokenStorage.clearUser();
      set({ ...initialState, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const result = await checkAuthUseCase.execute();
      if (result.authenticated) {
        set({
          isAuthenticated: true,
          user: result.user ?? null,
          isLoading: false,
        });
      } else {
        set({ ...initialState, isLoading: false });
      }
    } catch {
      set({ ...initialState, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    tokenStorage.clearUser();
    set({ ...initialState, isLoading: false });
  },
}));

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export { useAuthStore };
