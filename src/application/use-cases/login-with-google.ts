import type { User } from "@/src/domain/entities/user";
import type { AuthRepository } from "@/src/ports/outbound/auth-repository";
import type { TokenStorage } from "@/src/ports/outbound/token-storage";

type LoginWithGoogleResult = {
  user: User;
};

type LoginWithGoogleUseCase = {
  execute: (idToken: string) => Promise<LoginWithGoogleResult>;
};

const createLoginWithGoogleUseCase = (deps: {
  authRepository: AuthRepository;
  tokenStorage: TokenStorage;
}): LoginWithGoogleUseCase => ({
  execute: async (idToken) => {
    const response = await deps.authRepository.loginWithGoogle({ idToken });
    await deps.tokenStorage.saveTokens(response.tokens);

    return { user: response.user };
  },
});

export { createLoginWithGoogleUseCase };
export type { LoginWithGoogleResult, LoginWithGoogleUseCase };

