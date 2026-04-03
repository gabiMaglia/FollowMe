import { createDisplayName } from "@/src/domain/value-objects/display-name";
import type { AuthRepository } from "@/src/ports/outbound/auth-repository";

type UpdateProfileUseCase = {
  execute: (params: { displayName?: string }) => Promise<{
    id: string;
    email: string;
    displayName: string;
    onboardingCompleted: boolean;
  }>;
};

const createUpdateProfileUseCase = (deps: {
  authRepository: AuthRepository;
}): UpdateProfileUseCase => ({
  execute: async ({ displayName }) => {
    if (!displayName) {
      throw new Error("Display name is required");
    }

    const validDisplayName = createDisplayName(displayName);
    const updatedUser = await deps.authRepository.updateMyProfile({
      displayName: validDisplayName,
    });

    return updatedUser;
  },
});

export { createUpdateProfileUseCase };
export type { UpdateProfileUseCase };

