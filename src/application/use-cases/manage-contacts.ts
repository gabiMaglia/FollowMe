import type { Connection } from "@/src/domain/entities/connection";
import type { ContactsRepository } from "@/src/ports/outbound/contacts-repository";

type AcceptContactRequestUseCase = {
  execute: (userId: string) => Promise<Connection>;
};

type RejectContactRequestUseCase = {
  execute: (userId: string) => Promise<void>;
};

type CancelContactRequestUseCase = {
  execute: (userId: string) => Promise<void>;
};

type RemoveContactUseCase = {
  execute: (userId: string) => Promise<void>;
};

const createAcceptContactRequestUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): AcceptContactRequestUseCase => ({
  execute: async (userId) => {
    return deps.contactsRepository.acceptRequest(userId);
  },
});

const createRejectContactRequestUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): RejectContactRequestUseCase => ({
  execute: async (userId) => {
    await deps.contactsRepository.rejectRequest(userId);
  },
});

const createCancelContactRequestUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): CancelContactRequestUseCase => ({
  execute: async (userId) => {
    await deps.contactsRepository.cancelRequest(userId);
  },
});

const createRemoveContactUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): RemoveContactUseCase => ({
  execute: async (userId) => {
    await deps.contactsRepository.removeContact(userId);
  },
});

export {
    createAcceptContactRequestUseCase,
    createCancelContactRequestUseCase,
    createRejectContactRequestUseCase,
    createRemoveContactUseCase
};
export type {
    AcceptContactRequestUseCase,
    CancelContactRequestUseCase,
    RejectContactRequestUseCase,
    RemoveContactUseCase
};

