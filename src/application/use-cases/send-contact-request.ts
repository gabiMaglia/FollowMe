import type { Connection } from "@/src/domain/entities/connection";
import type { ContactsRepository } from "@/src/ports/outbound/contacts-repository";

type SendContactRequestUseCase = {
  execute: (targetUserId: string) => Promise<Connection>;
};

const createSendContactRequestUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): SendContactRequestUseCase => ({
  execute: async (targetUserId) => {
    return deps.contactsRepository.sendRequest(targetUserId);
  },
});

export { createSendContactRequestUseCase };
export type { SendContactRequestUseCase };

