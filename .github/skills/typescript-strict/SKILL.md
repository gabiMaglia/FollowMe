---
name: typescript-strict
description: "Use when writing or reviewing TypeScript code. Covers strict typing, inference, discriminated unions, branded types, utility types, generics, and avoiding any/as casts. Use for: type definitions, generics, type narrowing, type-safe patterns."
---

# TypeScript Strict Mode Patterns

## Core Rules

- `strict: true` is enabled. Never bypass it.
- Never use `any`. Use `unknown` and narrow.
- Avoid `as` casts. Use type guards or discriminated unions.
- Prefer `type` over `interface` for props and data shapes.
- Use `satisfies` to validate types without widening.
- Use `const` assertions for literal types.

## Type Definitions

```typescript
// Props: always use type
type ButtonProps = {
  label: string;
  variant: "primary" | "secondary";
  onPress: () => void;
  disabled?: boolean;
};

// Use satisfies for config objects
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
} satisfies Record<string, string | number>;
```

## Type Narrowing (never use `as`)

```typescript
// Discriminated unions
type Result<T> = { success: true; data: T } | { success: false; error: string };

const handleResult = <T>(result: Result<T>) => {
  if (result.success) {
    // TypeScript knows result.data exists here
    return result.data;
  }
  throw new Error(result.error);
};

// Type guards
const isString = (value: unknown): value is string => typeof value === "string";
```

## Generics

```typescript
// Constrained generics
const getProperty = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

// Generic components
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
};
```

## Utility Types

```typescript
// Prefer built-in utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserName = Pick<User, "firstName" | "lastName">;
type UserWithoutId = Omit<User, "id">;

// Record for dictionaries
type ThemeColors = Record<string, string>;

// Extract and Exclude for union manipulation
type Actions = "create" | "read" | "update" | "delete";
type WriteActions = Extract<Actions, "create" | "update" | "delete">;
```

## Enums & Constants

```typescript
// Prefer const objects over enums
const Status = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
} as const;

type Status = (typeof Status)[keyof typeof Status];
```

## Async Patterns

```typescript
// Always type async returns explicitly at boundaries
type FetchUser = (id: string) => Promise<Result<User>>;

// Use Awaited for unwrapping Promise types
type UserData = Awaited<ReturnType<typeof fetchUser>>;
```

## What NOT to Do

```typescript
// NEVER
const data: any = fetchData();
const user = response as User;
interface Props {} // use type instead
enum Status {} // use const object instead

// ALWAYS
const data: unknown = fetchData();
const user = parseUser(response); // with type guard
type Props = {};
const Status = {} as const;
```
