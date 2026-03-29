---
name: stylesheet-ux-ui
description: "Use when creating UI components, styling, layouts, theming, or designing user interfaces. Covers React Native StyleSheet, responsive design, light/dark themes, spacing systems, typography, touch targets, accessibility, animations, and mobile UX patterns. Use for: styling components, creating layouts, theming, responsive design, accessibility."
---

# StyleSheet & UX/UI Patterns

## StyleSheet Rules

1. Always use `StyleSheet.create()` at the bottom of the file
2. Never inline styles — not even `style={{ marginTop: 8 }}`
3. Never define style objects outside `StyleSheet.create()`
4. Colors always from `@/constants/theme` — never hardcoded hex
5. Use `useThemeColor()` for dynamic light/dark values

```tsx
// CORRECT
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.light.background,
  },
});

// WRONG — never do this
<View style={{ padding: 16, backgroundColor: "#fff" }} />;
```

## Spacing System

Use a consistent 4px base unit. Define spacing as multiples:

```typescript
// constants/spacing.ts
const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
```

Apply consistently:

```typescript
const styles = StyleSheet.create({
  container: {
    padding: Spacing.md, // 16
    gap: Spacing.sm, // 8
    marginBottom: Spacing.lg, // 24
  },
});
```

## Typography System

```typescript
// constants/theme.ts — define font scale
const FontSize = {
  xs: 12,
  sm: 14,
  md: 16, // body
  lg: 20,
  xl: 24,
  xxl: 32, // hero/title
} as const;

const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;
```

Use through `ThemedText` variants:

```tsx
<ThemedText type="title">Large heading</ThemedText>
<ThemedText type="subtitle">Section header</ThemedText>
<ThemedText type="defaultSemiBold">Emphasized body</ThemedText>
<ThemedText>Regular body text</ThemedText>
```

## Theming — Light / Dark

```tsx
import { useThemeColor } from "@/hooks/use-theme-color";

export const Card = ({ children }: { children: React.ReactNode }) => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
});
```

## Layout Patterns

### Flex Layouts

```typescript
const styles = StyleSheet.create({
  // Vertical stack (default)
  column: {
    flex: 1,
    gap: 8,
  },
  // Horizontal row
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  // Centered content
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Space between items
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
```

### Safe Areas

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

export const ScreenLayout = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaView style={styles.screen} edges={["top"]}>
    {children}
  </SafeAreaView>
);
```

## Touch Targets

Minimum 44x44pt touch targets (Apple HIG). Never smaller.

```typescript
const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

## Pressable with Feedback

```tsx
import { Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
};

export const ActionButton = ({ label, onPress }: ActionButtonProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
```

## Animated Interactions (Reanimated)

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export const ScalePressable = ({ children, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};
```

## Accessibility

```tsx
<Pressable
  onPress={handlePress}
  accessible
  accessibilityRole="button"
  accessibilityLabel="Follow user"
  accessibilityHint="Starts following this person"
>
  <ThemedText>Follow</ThemedText>
</Pressable>
```

Key rules:

- Every interactive element needs `accessibilityRole`
- Provide `accessibilityLabel` for non-text elements (icons, images)
- Use `accessibilityHint` for non-obvious actions
- Group related items with `accessibilityElementsHidden` or `importantForAccessibility`

## Responsive Design

```tsx
import { Dimensions, useWindowDimensions } from "react-native";

export const ResponsiveGrid = () => {
  const { width } = useWindowDimensions();
  const columns = width > 768 ? 3 : width > 480 ? 2 : 1;
  const itemWidth = (width - Spacing.md * (columns + 1)) / columns;

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={[styles.gridItem, { width: itemWidth }]}>
          <ItemCard item={item} />
        </View>
      ))}
    </View>
  );
};
```

## UX Best Practices

1. **Loading states** — always show skeleton/spinner, never blank screens
2. **Error states** — friendly message + retry action, never raw error strings
3. **Empty states** — illustration + message + CTA, never just "No data"
4. **Haptic feedback** — on button presses, toggles, destructive actions
5. **Smooth transitions** — use Reanimated for enter/exit animations
6. **Pull to refresh** — on scrollable lists with `RefreshControl`
7. **Optimistic updates** — update UI immediately, rollback on failure
8. **Keyboard avoidance** — use `KeyboardAvoidingView` on forms
9. **Edge-to-edge** — respect safe areas, no content under notch/nav bar
10. **Consistent border radius** — small: 8, medium: 12, large: 16, full: 9999
