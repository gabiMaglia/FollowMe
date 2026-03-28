# FollowMe — Project Guidelines

## Tech Stack

- Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9
- Expo Router 6 (file-based routing)
- React Native Reanimated 4 for animations
- React Native New Architecture enabled
- React Compiler enabled

## Code Style

- **Language**: TypeScript strict mode. No `any`. No `as` casts unless unavoidable.
- **Filenames**: kebab-case for files (`themed-text.tsx`), PascalCase for exports (`ThemedText`).
- **Imports**: Always use `@/` path alias. Never relative imports (`../`).
- **Exports**: Named exports only. No default exports.
- **Functions**: Arrow functions for components and handlers. No `function` keyword for components.
- **Props**: Destructure props. Spread `...rest` last. Define prop types with `type`, not `interface`.

## Architecture — Hexagonal (Ports & Adapters)

```
src/
  domain/          # Pure business logic, entities, value objects. Zero dependencies.
  application/     # Use cases / services. Depends only on domain.
  ports/           # Interfaces (contracts) for adapters.
  adapters/        # Implementations: API clients, storage, notifications.
app/               # Expo Router screens — presentation layer only.
components/        # Reusable UI components.
hooks/             # Custom React hooks.
constants/         # Theme, config, enums.
```

- **Domain layer** has no imports from React, React Native, Expo, or any adapter.
- **Use cases** in `application/` orchestrate domain logic and call ports.
- **Adapters** implement port interfaces and handle external concerns (API, AsyncStorage, etc.).
- **Screens** (`app/`) are thin: call hooks, render components. No business logic.

## Styling

- Use `StyleSheet.create()` at the bottom of each file.
- Never inline styles. Never use style objects outside `StyleSheet.create()`.
- Colors always from `@/constants/theme`. Never hardcoded hex values.
- Use `useThemeColor()` hook for dynamic light/dark colors.

## Conventions

- One component per file.
- Co-locate tests next to source: `foo.test.ts` beside `foo.ts`.
- Keep hooks small and composable.
- Platform-specific code uses file extensions: `.ios.ts`, `.android.ts`, `.web.ts`.
- Animations use React Native Reanimated worklets, not `Animated` API.
- Use Expo APIs (expo-haptics, expo-image, etc.) over bare RN equivalents.
