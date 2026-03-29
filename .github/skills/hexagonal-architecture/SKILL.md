---
name: hexagonal-architecture
description: "Use when creating domain logic, use cases, services, ports, adapters, repositories, or implementing clean architecture patterns. Covers hexagonal/ports-and-adapters architecture, dependency inversion, domain isolation, and layered boundaries. Use for: business logic, API clients, storage adapters, service layers."
---

# Hexagonal Architecture (Ports & Adapters)

## Layer Structure

```
src/
  domain/          # Pure business logic — ZERO external dependencies
    entities/      # Core business objects
    value-objects/ # Immutable descriptors (Email, Money, Coordinates)
    errors/        # Domain-specific error types

  application/     # Use cases — orchestrates domain + ports
    use-cases/     # Single-responsibility operations
    services/      # Cross-cutting application services

  ports/           # Contracts (interfaces) — adapters implement these
    inbound/       # Driven by the app (UI calls these)
    outbound/      # App drives these (API, storage, notifications)

  adapters/        # Implementations of ports
    api/           # REST/GraphQL clients
    storage/       # AsyncStorage, SQLite, SecureStore
    notification/  # Push notifications, in-app alerts
    location/      # GPS, geofencing
```

## Dependency Rule

```
UI (app/) → hooks/ → application/ → domain/
                    → ports/ (interfaces only)
                    ↑
            adapters/ (implements ports)
```

- **Domain** imports NOTHING external. No React, no Expo, no AsyncStorage.
- **Application** imports domain + port interfaces. Never concrete adapters.
- **Adapters** import port interfaces and implement them.
- **UI layer** (app/, components/, hooks/) wires adapters to ports via dependency injection.

## Domain Layer

Pure TypeScript. No framework dependencies. Fully testable without mocks.

```typescript
// src/domain/entities/user.ts
type User = {
  id: string;
  email: Email;
  displayName: string;
  createdAt: Date;
};

// src/domain/value-objects/email.ts
type Email = string & { readonly __brand: unique symbol };

const createEmail = (raw: string): Email => {
  const trimmed = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new InvalidEmailError(raw);
  }
  return trimmed as Email;
};

// src/domain/errors/invalid-email-error.ts
class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
    this.name = "InvalidEmailError";
  }
}
```

## Ports (Interfaces)

```typescript
// src/ports/outbound/user-repository.ts
type UserRepository = {
  findById: (id: string) => Promise<User | null>;
  findByEmail: (email: Email) => Promise<User | null>;
  save: (user: User) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

// src/ports/outbound/location-service.ts
type LocationService = {
  getCurrentPosition: () => Promise<Coordinates>;
  watchPosition: (callback: (coords: Coordinates) => void) => () => void;
};

// src/ports/outbound/notification-service.ts
type NotificationService = {
  requestPermission: () => Promise<boolean>;
  sendLocal: (title: string, body: string) => Promise<void>;
};
```

## Application Layer (Use Cases)

Each use case is a single function. It orchestrates domain logic and calls ports.

```typescript
// src/application/use-cases/get-user-profile.ts
import type { UserRepository } from "@/src/ports/outbound/user-repository";
import type { User } from "@/src/domain/entities/user";

type GetUserProfile = {
  execute: (userId: string) => Promise<User>;
};

const createGetUserProfile = (deps: {
  userRepository: UserRepository;
}): GetUserProfile => ({
  execute: async (userId) => {
    const user = await deps.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }
    return user;
  },
});
```

## Adapters (Implementations)

```typescript
// src/adapters/api/user-api-adapter.ts
import type { UserRepository } from "@/src/ports/outbound/user-repository";

const createUserApiAdapter = (baseUrl: string): UserRepository => ({
  findById: async (id) => {
    const response = await fetch(`${baseUrl}/users/${id}`);
    if (!response.ok) return null;
    return response.json();
  },

  findByEmail: async (email) => {
    const response = await fetch(`${baseUrl}/users?email=${email}`);
    if (!response.ok) return null;
    return response.json();
  },

  save: async (user) => {
    await fetch(`${baseUrl}/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
  },

  delete: async (id) => {
    await fetch(`${baseUrl}/users/${id}`, { method: "DELETE" });
  },
});

// src/adapters/storage/user-storage-adapter.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserRepository } from "@/src/ports/outbound/user-repository";

const createUserStorageAdapter = (): UserRepository => ({
  findById: async (id) => {
    const raw = await AsyncStorage.getItem(`user:${id}`);
    return raw ? JSON.parse(raw) : null;
  },
  // ...
});
```

## Wiring — Dependency Injection via Hooks

```typescript
// hooks/use-user-profile.ts
import { createGetUserProfile } from "@/src/application/use-cases/get-user-profile";
import { createUserApiAdapter } from "@/src/adapters/api/user-api-adapter";

const userRepository = createUserApiAdapter("https://api.followme.app");
const getUserProfile = createGetUserProfile({ userRepository });

export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserProfile
      .execute(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { user, error, isLoading };
};
```

## Testing

Domain and application layers are tested WITHOUT mocks for external dependencies:

```typescript
// src/application/use-cases/get-user-profile.test.ts
const mockRepo: UserRepository = {
  findById: async (id) => (id === "1" ? testUser : null),
  findByEmail: async () => null,
  save: async () => {},
  delete: async () => {},
};

const useCase = createGetUserProfile({ userRepository: mockRepo });

test("returns user when found", async () => {
  const user = await useCase.execute("1");
  expect(user).toEqual(testUser);
});

test("throws when user not found", async () => {
  await expect(useCase.execute("999")).rejects.toThrow(UserNotFoundError);
});
```

## Rules

1. **Domain is pure** — no imports from React, RN, Expo, or any framework
2. **Depend on abstractions** — application layer uses port types, never adapters directly
3. **Factory functions** — use `createX(deps)` pattern for dependency injection
4. **One use case, one file** — single responsibility per use case
5. **Adapters are swappable** — API adapter in prod, in-memory adapter in tests
6. **UI never touches domain directly** — always goes through hooks → use cases
