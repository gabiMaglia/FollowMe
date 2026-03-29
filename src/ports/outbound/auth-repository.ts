import type { AuthTokens } from "@/src/domain/entities/auth-tokens";
import type { User } from "@/src/domain/entities/user";

type LoginParams = {
  email: string;
  password: string;
};

type RegisterParams = {
  email: string;
  displayName: string;
  password: string;
};

type GoogleAuthParams = {
  idToken: string;
};

type OnboardingParams = {
  dateOfBirth: string;
};

type AuthResponse = {
  tokens: AuthTokens;
  user: User;
};

type RegisterResponse = {
  message: string;
  user: User;
};

type OnboardingResponse = {
  message: string;
  onboardingCompleted: boolean;
  isMinor: boolean;
};

type RefreshResponse = AuthTokens;

type AuthRepository = {
  login: (params: LoginParams) => Promise<AuthResponse>;
  register: (params: RegisterParams) => Promise<RegisterResponse>;
  loginWithGoogle: (params: GoogleAuthParams) => Promise<AuthResponse>;
  completeOnboarding: (
    params: OnboardingParams,
    accessToken: string,
  ) => Promise<OnboardingResponse>;
  refreshToken: (refreshToken: string) => Promise<RefreshResponse>;
  logout: (refreshToken: string) => Promise<void>;
  logoutAll: (accessToken: string) => Promise<void>;
};

export type {
    AuthRepository, AuthResponse, GoogleAuthParams, LoginParams, OnboardingParams, OnboardingResponse,
    RefreshResponse, RegisterParams, RegisterResponse
};

