import type { Contact, PendingRequest } from "@/src/domain/entities/connection";
import type { ContactsRepository } from "@/src/ports/outbound/contacts-repository";

type GetContactsUseCase = {
  execute: () => Promise<Contact[]>;
};

type GetIncomingRequestsUseCase = {
  execute: () => Promise<PendingRequest[]>;
};

type GetSentRequestsUseCase = {
  execute: () => Promise<PendingRequest[]>;
};

const createGetContactsUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): GetContactsUseCase => ({
  execute: async () => {
    return deps.contactsRepository.getContacts();
  },
});

const createGetIncomingRequestsUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): GetIncomingRequestsUseCase => ({
  execute: async () => {
    return deps.contactsRepository.getIncomingRequests();
  },
});

const createGetSentRequestsUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): GetSentRequestsUseCase => ({
  execute: async () => {
    return deps.contactsRepository.getSentRequests();
  },
});

export {
    createGetContactsUseCase,
    createGetIncomingRequestsUseCase,
    createGetSentRequestsUseCase
};
export type {
    GetContactsUseCase,
    GetIncomingRequestsUseCase,
    GetSentRequestsUseCase
};

