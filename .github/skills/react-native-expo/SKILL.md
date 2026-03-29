---
name: react-native-expo
description: "Use when building React Native components, screens, navigation, or Expo features. Covers Expo SDK 54, Expo Router 6, React Native 0.81, React 19, Reanimated 4, platform-specific code, and Expo APIs. Use for: creating screens, components, navigation, animations, haptics, images, linking."
---

# React Native & Expo SDK 54 Patterns

## Component Pattern

Always use arrow functions, named exports, destructured props with `...rest` spread last.

```tsx
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type ProfileCardProps = {
  name: string;
  bio: string;
  avatarUrl: string;
};

export const ProfileCard = ({ name, bio, avatarUrl }: ProfileCardProps) => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{name}</ThemedText>
      <ThemedText>{bio}</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
});
```

## Expo Router 6 — File-Based Routing

```
app/
  _layout.tsx          # Root Stack navigator
  index.tsx            # Home screen (/)
  modal.tsx            # Modal screen
  (tabs)/
    _layout.tsx        # Tab navigator
    index.tsx          # First tab
    explore.tsx        # Second tab
  [id].tsx             # Dynamic route /123
  settings/
    _layout.tsx        # Nested stack
    index.tsx          # /settings
    profile.tsx        # /settings/profile
```

### Layouts

```tsx
import { Stack } from "expo-router";

export const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
};
```

### Navigation

```tsx
import { Link, useRouter } from "expo-router";

// Declarative
<Link href="/settings/profile">Go to Profile</Link>;

// Imperative
const router = useRouter();
router.push("/settings/profile");
router.replace("/login");
router.back();
```

### Route Parameters

```tsx
import { useLocalSearchParams } from "expo-router";

// In app/[id].tsx
const { id } = useLocalSearchParams<{ id: string }>();
```

## Screens — Keep Thin

Screens are presentation only. They call hooks and render components. No business logic.

```tsx
// app/(tabs)/index.tsx
import { useUsers } from "@/hooks/use-users";
import { UserList } from "@/components/user-list";

export const HomeScreen = () => {
  const { users, isLoading, error } = useUsers();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error.message} />;

  return <UserList users={users} />;
};
```

## React Native Reanimated 4

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

export const AnimatedCard = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.1, {}, (finished) => {
      "worklet";
      if (finished) {
        scale.value = withTiming(1);
      }
    });
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Pressable onPress={handlePress} />
    </Animated.View>
  );
};
```

## Expo APIs — Always Prefer Over Bare RN

| Task      | Use This             | Not This            |
| --------- | -------------------- | ------------------- |
| Images    | `expo-image`         | `<Image>` from RN   |
| Haptics   | `expo-haptics`       | third-party libs    |
| Fonts     | `expo-font`          | manual font loading |
| Linking   | `expo-linking`       | `Linking` from RN   |
| Browser   | `expo-web-browser`   | `Linking.openURL`   |
| Splash    | `expo-splash-screen` | manual splash logic |
| Icons     | `expo-symbols` (iOS) | icon fonts only     |
| Constants | `expo-constants`     | hardcoded values    |

### expo-image

```tsx
import { Image } from "expo-image";

<Image
  source={{ uri: avatarUrl }}
  style={styles.avatar}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
/>;
```

### expo-haptics

```tsx
import * as Haptics from "expo-haptics";

const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
```

## Platform-Specific Code

Use file extensions, not `Platform.select()` for significant differences:

```
components/
  icon-symbol.tsx        # Android/Web fallback
  icon-symbol.ios.tsx    # iOS with SF Symbols
hooks/
  use-color-scheme.ts       # Native
  use-color-scheme.web.ts   # Web (handles SSR hydration)
```

Use `Platform.OS` only for minor style tweaks.

## Hooks — Small and Composable

```tsx
// hooks/use-theme-color.ts
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export const useThemeColor = (
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) => {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  return colorFromProps ?? Colors[theme][colorName];
};
```

## Key Rules

1. **One component per file** — kebab-case filename, PascalCase export
2. **`@/` imports only** — never relative `../`
3. **Named exports only** — no `export default`
4. **StyleSheet at bottom** — never inline styles
5. **Screens are thin** — hooks + components, no logic
6. **Expo APIs first** — over bare React Native equivalents
7. **Reanimated for animations** — never use `Animated` from RN
8. **Platform files** — `.ios.ts`, `.android.ts`, `.web.ts` for platform splits
