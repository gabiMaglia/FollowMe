import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";

import { ContactAvatar } from "@/components/search-contact-card";
import { ThemedText } from "@/components/themed-text";
import { Radii, Shadows, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type ContactCardProps = {
  userId: string;
  displayName: string;
  isLocationShared: boolean;
  theyShareLocation: boolean;
  onRemove: (userId: string) => void;
  disabled?: boolean;
};

export const ContactCard = ({
  userId,
  displayName,
  isLocationShared,
  theyShareLocation,
  onRemove,
  disabled = false,
}: ContactCardProps) => {
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const successColor = useThemeColor({}, "success");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const errorColor = useThemeColor({}, "error");
  const textInverseColor = useThemeColor({}, "textInverse");

  const getStatusText = () => {
    if (isLocationShared && theyShareLocation) return "Ubicación compartida";
    if (isLocationShared) return "Compartís tu ubicación";
    if (theyShareLocation) return "Comparte su ubicación";
    return "Sin compartir ubicación";
  };

  const isSharing = isLocationShared || theyShareLocation;

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove(userId);
  };

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.cardContent}>
        <ContactAvatar displayName={displayName} />
        <View style={styles.cardInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {displayName}
          </ThemedText>
          <ThemedText
            style={[
              styles.statusText,
              { color: isSharing ? successColor : textSecondaryColor },
            ]}
          >
            {getStatusText()}
          </ThemedText>
        </View>
        <Pressable
          onPress={handleRemove}
          disabled={disabled}
          style={({ pressed }) => [
            styles.removeButton,
            {
              backgroundColor: pressed ? errorColor : "transparent",
              borderColor: errorColor,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {({ pressed }) => (
            <ThemedText
              style={[
                styles.removeButtonText,
                { color: pressed ? textInverseColor : errorColor },
              ]}
            >
              Eliminar
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
};

type SentRequestCardProps = {
  userId: string;
  displayName: string;
  onCancel: (userId: string) => void;
  disabled?: boolean;
};

export const SentRequestCard = ({
  userId,
  displayName,
  onCancel,
  disabled = false,
}: SentRequestCardProps) => {
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "error");
  const textInverseColor = useThemeColor({}, "textInverse");

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel(userId);
  };

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.cardContent}>
        <ContactAvatar displayName={displayName} />
        <View style={styles.cardInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {displayName}
          </ThemedText>
          <ThemedText style={[styles.statusText, { color: borderColor }]}>
            Solicitud pendiente
          </ThemedText>
        </View>
        <Pressable
          onPress={handleCancel}
          disabled={disabled}
          style={({ pressed }) => [
            styles.cancelButton,
            {
              backgroundColor: pressed ? errorColor : "transparent",
              borderColor: errorColor,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {({ pressed }) => (
            <ThemedText
              style={[
                styles.cancelButtonText,
                { color: pressed ? textInverseColor : errorColor },
              ]}
            >
              Retirar
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
};

type IncomingRequestCardProps = {
  userId: string;
  displayName: string;
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
  disabled?: boolean;
};

export const IncomingRequestCard = ({
  userId,
  displayName,
  onAccept,
  onReject,
  disabled = false,
}: IncomingRequestCardProps) => {
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const primaryPressedColor = useThemeColor({}, "primaryPressed");
  const textInverseColor = useThemeColor({}, "textInverse");
  const textSecondaryColor = useThemeColor({}, "textSecondary");

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAccept(userId);
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReject(userId);
  };

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.cardContent}>
        <ContactAvatar displayName={displayName} />
        <View style={styles.cardInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {displayName}
          </ThemedText>
          <ThemedText
            style={[styles.statusText, { color: textSecondaryColor }]}
          >
            Quiere ser tu contacto
          </ThemedText>
        </View>
        <View style={styles.requestActions}>
          <Pressable
            onPress={handleAccept}
            disabled={disabled}
            style={({ pressed }) => [
              styles.acceptButton,
              {
                backgroundColor: pressed ? primaryPressedColor : primaryColor,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <ThemedText
              style={[styles.actionText, { color: textInverseColor }]}
            >
              Aceptar
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={handleReject}
            disabled={disabled}
            style={({ pressed }) => [
              styles.rejectButton,
              {
                borderColor: textSecondaryColor,
                opacity: pressed ? 0.7 : disabled ? 0.5 : 1,
              },
            ]}
          >
            <ThemedText
              style={[styles.actionText, { color: textSecondaryColor }]}
            >
              Rechazar
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    gap: Spacing.xxs,
  },
  statusText: {
    fontSize: 13,
  },
  removeButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  requestActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  acceptButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
