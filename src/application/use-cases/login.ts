import type { User } from "@/src/domain/entities/user";
import { createEmail } from "@/src/domain/value-objects/email";
import { createPassword } from "@/src/domain/value-objects/password";
import type { AuthRepository } from "@/src/ports/outbound/auth-repository";
import type { TokenStorage } from "@/src/ports/outbound/token-storage";

type LoginResult = {
  user: User;
};

type LoginUseCase = {
  execute: (email: string, password: string) => Promise<LoginResult>;
};

const createLoginUseCase = (deps: {
  authRepository: AuthRepository;
  tokenStorage: TokenStorage;
}): LoginUseCase => ({
  execute: async (email, password) => {
    createEmail(email);
    createPassword(password);

    const response = await deps.authRepository.login({ email, password });
    await deps.tokenStorage.saveTokens(response.tokens);

    return { user: response.user };
  },
});

export { createLoginUseCase };
export type { LoginResult, LoginUseCase };

