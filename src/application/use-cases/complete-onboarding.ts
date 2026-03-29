import { createDateOfBirth } from "@/src/domain/value-objects/date-of-birth";
import type { AuthRepository } from "@/src/ports/outbound/auth-repository";
import type { TokenStorage } from "@/src/ports/outbound/token-storage";

type OnboardingResult = {
  onboardingCompleted: boolean;
  isMinor: boolean;
};

type CompleteOnboardingUseCase = {
  execute: (dateOfBirth: string) => Promise<OnboardingResult>;
};

const createCompleteOnboardingUseCase = (deps: {
  authRepository: AuthRepository;
  tokenStorage: TokenStorage;
}): CompleteOnboardingUseCase => ({
  execute: async (dateOfBirth) => {
    const validDob = createDateOfBirth(dateOfBirth);

    const tokens = await deps.tokenStorage.getTokens();
    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await deps.authRepository.completeOnboarding(
      { dateOfBirth: validDob },
      tokens.accessToken,
    );

    return {
      onboardingCompleted: response.onboardingCompleted,
      isMinor: response.isMinor,
    };
  },
});

export { createCompleteOnboardingUseCase };
export type { CompleteOnboardingUseCase, OnboardingResult };

