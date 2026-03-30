import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radii, Shadows, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type ContactAvatarProps = {
  displayName: string;
  size?: number;
};

export const ContactAvatar = ({
  displayName,
  size = 48,
}: ContactAvatarProps) => {
  const backgroundColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "textInverse");

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <ThemedText
        style={[styles.avatarText, { color: textColor, fontSize: size * 0.38 }]}
      >
        {initials}
      </ThemedText>
    </View>
  );
};

type SearchContactCardProps = {
  userId: string;
  displayName: string;
  connectionStatus: string;
  onSendRequest: (userId: string) => void;
  disabled?: boolean;
};

export const SearchContactCard = ({
  userId,
  displayName,
  connectionStatus,
  onSendRequest,
  disabled = false,
}: SearchContactCardProps) => {
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const primaryPressedColor = useThemeColor({}, "primaryPressed");
  const textInverseColor = useThemeColor({}, "textInverse");
  const textSecondaryColor = useThemeColor({}, "textSecondary");

  const isPending = connectionStatus === "PENDING_SENT";
  const isConnected = connectionStatus === "CONNECTED";
  const canSendRequest = connectionStatus === "NONE";

  const handleSendRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendRequest(userId);
  };

  const getButtonLabel = () => {
    if (isConnected) return "Contacto";
    if (isPending) return "Solicitud enviada";
    return "Enviar solicitud";
  };

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.cardContent}>
        <ContactAvatar displayName={displayName} />
        <View style={styles.cardInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {displayName}
          </ThemedText>
        </View>
        {canSendRequest ? (
          <Pressable
            onPress={handleSendRequest}
            disabled={disabled}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: pressed ? primaryPressedColor : primaryColor,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <ThemedText
              style={[styles.actionButtonText, { color: textInverseColor }]}
            >
              Enviar solicitud
            </ThemedText>
          </Pressable>
        ) : (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isPending ? "transparent" : primaryColor,
                borderColor: isPending ? textSecondaryColor : primaryColor,
                borderWidth: isPending ? 1 : 0,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.statusBadgeText,
                {
                  color: isPending ? textSecondaryColor : textInverseColor,
                },
              ]}
            >
              {getButtonLabel()}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "600",
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    ...Shadows.light,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  actionButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
