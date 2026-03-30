import type { PaginatedSearchResult } from "@/src/domain/entities/connection";
import type {
    ContactsRepository,
    SearchUsersParams,
} from "@/src/ports/outbound/contacts-repository";

type SearchUsersUseCase = {
  execute: (params: SearchUsersParams) => Promise<PaginatedSearchResult>;
};

const createSearchUsersUseCase = (deps: {
  contactsRepository: ContactsRepository;
}): SearchUsersUseCase => ({
  execute: async (params) => {
    return deps.contactsRepository.searchUsers(params);
  },
});

export { createSearchUsersUseCase };
export type { SearchUsersUseCase };

