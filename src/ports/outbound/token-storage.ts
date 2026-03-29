import type { AuthTokens } from "@/src/domain/entities/auth-tokens";
import type { User } from "@/src/domain/entities/user";

type TokenStorage = {
  getTokens: () => Promise<AuthTokens | null>;
  saveTokens: (tokens: AuthTokens) => Promise<void>;
  clearTokens: () => Promise<void>;
  getUser: () => Promise<User | null>;
  saveUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
};

export type { TokenStorage };
