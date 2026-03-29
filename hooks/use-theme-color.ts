import { type ColorKey, Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const useThemeColor = (
  props: { light?: string; dark?: string },
  colorName: ColorKey,
) => {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  return colorFromProps ?? Colors[theme][colorName];
};
