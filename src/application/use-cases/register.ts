import type { User } from "@/src/domain/entities/user";
import { createDisplayName } from "@/src/domain/value-objects/display-name";
import { createEmail } from "@/src/domain/value-objects/email";
import { createPassword } from "@/src/domain/value-objects/password";
import type { AuthRepository } from "@/src/ports/outbound/auth-repository";

type RegisterResult = {
  user: User;
};

type RegisterUseCase = {
  execute: (
    email: string,
    displayName: string,
    password: string,
  ) => Promise<RegisterResult>;
};

const createRegisterUseCase = (deps: {
  authRepository: AuthRepository;
}): RegisterUseCase => ({
  execute: async (email, displayName, password) => {
    createEmail(email);
    createDisplayName(displayName);
    createPassword(password);

    const response = await deps.authRepository.register({
      email,
      displayName,
      password,
    });

    return { user: response.user };
  },
});

export { createRegisterUseCase };
export type { RegisterResult, RegisterUseCase };

