---
description: "Use when creating or editing domain entities, value objects, or domain errors. Domain code must be pure TypeScript with zero external dependencies."
applyTo: "src/domain/**/*.ts"
---

# Domain Layer Rules

- **Zero dependencies**: No imports from React, React Native, Expo, or any adapter/framework.
- Pure TypeScript only — fully testable without mocks.
- Use branded types for value objects (`Email`, `UserId`, `Coordinates`).
- Use factory functions (`createX`) with validation instead of constructors.
- Throw domain-specific errors, never generic `Error`.
- Use `type` for all type definitions. No `interface`.
