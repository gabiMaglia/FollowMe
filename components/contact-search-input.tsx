import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

import { FontSize, Radii, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type ContactSearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export const ContactSearchInput = ({
  value,
  onChangeText,
  placeholder = "Buscar usuarios...",
}: ContactSearchInputProps) => {
  const inputBackgroundColor = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "textSecondary");
  const iconColor = useThemeColor({}, "icon");

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: inputBackgroundColor, borderColor },
      ]}
    >
      <Ionicons name="search" size={20} color={iconColor} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm,
  },
});
