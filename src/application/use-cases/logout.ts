import type { AuthRepository } from "@/src/ports/outbound/auth-repository";
import type { TokenStorage } from "@/src/ports/outbound/token-storage";

type LogoutUseCase = {
  execute: () => Promise<void>;
};

const createLogoutUseCase = (deps: {
  authRepository: AuthRepository;
  tokenStorage: TokenStorage;
}): LogoutUseCase => ({
  execute: async () => {
    const tokens = await deps.tokenStorage.getTokens();

    if (tokens?.refreshToken) {
      try {
        await deps.authRepository.logout(tokens.refreshToken);
      } catch {
        // Server logout is best-effort; always clear local tokens
      }
    }

    await deps.tokenStorage.clearTokens();
  },
});

type LogoutAllUseCase = {
  execute: () => Promise<void>;
};

const createLogoutAllUseCase = (deps: {
  authRepository: AuthRepository;
  tokenStorage: TokenStorage;
}): LogoutAllUseCase => ({
  execute: async () => {
    const tokens = await deps.tokenStorage.getTokens();

    if (tokens?.accessToken) {
      await deps.authRepository.logoutAll(tokens.accessToken);
    }

    await deps.tokenStorage.clearTokens();
  },
});

export { createLogoutAllUseCase, createLogoutUseCase };
export type { LogoutAllUseCase, LogoutUseCase };

