---
description: "Use when creating or editing React Native components. Components must follow single-responsibility, use StyleSheet, support theming, and follow naming conventions."
applyTo: "components/**/*.tsx"
---

# Component File Rules

- One component per file.
- Filename: kebab-case. Export: PascalCase, named only.
- Arrow functions for components. Destructure props, spread `...rest` last.
- Use `type` for props (not `interface`).
- `StyleSheet.create()` at file bottom. Never inline styles.
- Colors from `@/constants/theme` or `useThemeColor()`.
- Minimum 44pt touch targets on interactive elements.
- Use `expo-image` over `<Image>` from React Native.
- Use Reanimated for animations, never `Animated` API.
