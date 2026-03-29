/**
 * FollowMe Design System
 *
 * All colors, typography, spacing, and visual tokens.
 * Components use semantic tokens via `Colors.light` / `Colors.dark`.
 * Never hardcode hex values in StyleSheet — always import from here.
 */

import { Platform } from "react-native";

// ============================================================================
// 1. PRIMITIVE PALETTE — Never used directly in components
// ============================================================================
const palette = {
  // Primary: Salmon pink (main actions, CTA buttons)
  salmon100: "#FCE5E3",
  salmon300: "#F7B5AF",
  salmon500: "#F27D72",
  salmon700: "#C2645B",
  salmon900: "#793E39",

  // Secondary/Brand: Mustard (splash screen, warm accents)
  mustard100: "#F9F2D9",
  mustard300: "#E6C76D",
  mustard500: "#D4A017",
  mustard700: "#947010",
  mustard900: "#554009",

  // Neutrals (backgrounds, text, borders)
  neutral0: "#FFFFFF",
  neutral50: "#F9FAFB",
  neutral100: "#F3F4F6",
  neutral300: "#D1D5DB",
  neutral500: "#6B7280",
  neutral700: "#374151",
  neutral800: "#1F2937",
  neutral900: "#111827",

  // System states
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
} as const;

// ============================================================================
// 2. SEMANTIC COLOR TOKENS — Light & Dark
// ============================================================================
const lightColors = {
  // Backgrounds
  background: palette.neutral50,
  surface: palette.neutral0,
  brandBackground: palette.mustard500,

  // Brand
  primary: palette.salmon500,
  primaryPressed: palette.salmon700,
  secondary: palette.mustard500,

  // Text
  text: palette.neutral900,
  textSecondary: palette.neutral500,
  textInverse: palette.neutral0,
  textBrand: palette.mustard900,

  // UI elements
  border: palette.neutral300,
  divider: palette.neutral100,
  icon: palette.neutral700,
  inputBackground: palette.neutral0,
  tint: palette.salmon500,
  tabIconDefault: palette.neutral500,
  tabIconSelected: palette.salmon500,

  // States
  success: palette.success,
  error: palette.error,
  warning: palette.warning,
  info: palette.info,
} as const;

const darkColors = {
  // Backgrounds
  background: palette.neutral900,
  surface: palette.neutral800,
  brandBackground: palette.mustard900,

  // Brand
  primary: palette.salmon300,
  primaryPressed: palette.salmon500,
  secondary: palette.mustard300,

  // Text
  text: palette.neutral50,
  textSecondary: palette.neutral300,
  textInverse: palette.neutral900,
  textBrand: palette.mustard300,

  // UI elements
  border: palette.neutral700,
  divider: palette.neutral800,
  icon: palette.neutral300,
  inputBackground: palette.neutral800,
  tint: palette.salmon300,
  tabIconDefault: palette.neutral500,
  tabIconSelected: palette.salmon300,

  // States
  success: palette.success,
  error: palette.error,
  warning: palette.warning,
  info: palette.info,
} as const;

export const Colors = {
  light: lightColors,
  dark: darkColors,
  palette,
} as const;

/** Backward-compatible alias — prefer `Colors.palette.mustard500` */
export const BrandColors = {
  splash: palette.mustard500,
} as const;

// ============================================================================
// 3. TYPOGRAPHY
// ============================================================================
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui" as const,
    serif: "ui-serif" as const,
    rounded: "ui-rounded" as const,
    mono: "ui-monospace" as const,
  },
  default: {
    sans: "normal" as const,
    serif: "serif" as const,
    rounded: "normal" as const,
    mono: "monospace" as const,
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" as const,
    serif: "Georgia, 'Times New Roman', serif" as const,
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif" as const,
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" as const,
  },
});

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  h1: 32,
  logo: 42,
} as const;

export const LineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 28,
  xxl: 32,
  h1: 40,
} as const;

// ============================================================================
// 4. SPACING (4px base grid)
// ============================================================================
export const Spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 64,
} as const;

// ============================================================================
// 5. RADII
// ============================================================================
export const Radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

// ============================================================================
// 6. SHADOWS (cross-platform)
// ============================================================================
export const Shadows = {
  none: {
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  light: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medium: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heavy: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
} as const;

// ============================================================================
// 7. TYPE EXPORTS
// ============================================================================
type ColorTokens = typeof lightColors;
type ColorKey = keyof ColorTokens;
type ThemeMode = "light" | "dark";

export type { ColorKey, ColorTokens, ThemeMode };
