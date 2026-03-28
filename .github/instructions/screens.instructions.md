---
description: "Use when creating or editing Expo Router screen files. Screens must be thin presentation layers that call hooks and render components with no business logic."
applyTo: "app/**/*.tsx"
---

# Screen File Rules

- Screens are thin: call hooks, render components. **No business logic.**
- Use named exports. No `export default`.
- Use arrow functions for components.
- Import from `@/` only. Never relative imports.
- Handle 3 states: loading, error, success.
- Use `StyleSheet.create()` at the bottom. Never inline styles.
