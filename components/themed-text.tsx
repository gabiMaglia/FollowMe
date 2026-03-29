import { StyleSheet, Text, type TextProps } from "react-native";

import { FontSize, LineHeight } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export const ThemedText = ({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) => {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const linkColor = useThemeColor({}, "primary");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? [styles.link, { color: linkColor }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  },
  defaultSemiBold: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: "600",
  },
  title: {
    fontSize: FontSize.h1,
    fontWeight: "bold",
    lineHeight: LineHeight.h1,
  },
  subtitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    lineHeight: LineHeight.xl,
  },
  link: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.lg,
  },
});
