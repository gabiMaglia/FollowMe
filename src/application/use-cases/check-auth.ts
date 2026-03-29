import type { AuthTokens } from "@/src/domain/entities/auth-tokens";
import type { User } from "@/src/domain/entities/user";
import type { AuthRepository } from "@/src/ports/outbound/auth-repository";
import type { TokenStorage } from "@/src/ports/outbound/token-storage";

type CheckAuthResult =
  | { authenticated: true; tokens: AuthTokens; user: User | null }
  | { authenticated: false };

type CheckAuthUseCase = {
  execute: () => Promise<CheckAuthResult>;
};

const createCheckAuthUseCase = (deps: {
  authRepository: AuthRepository;
  tokenStorage: TokenStorage;
}): CheckAuthUseCase => ({
  execute: async () => {
    const tokens = await deps.tokenStorage.getTokens();

    if (!tokens) {
      return { authenticated: false };
    }

    try {
      const newTokens = await deps.authRepository.refreshToken(
        tokens.refreshToken,
      );
      await deps.tokenStorage.saveTokens(newTokens);
      const user = await deps.tokenStorage.getUser();
      return { authenticated: true, tokens: newTokens, user };
    } catch {
      await deps.tokenStorage.clearTokens();
      await deps.tokenStorage.clearUser();
      return { authenticated: false };
    }
  },
});

export { createCheckAuthUseCase };
export type { CheckAuthResult, CheckAuthUseCase };

