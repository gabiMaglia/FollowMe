import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useContactsStore } from "@/hooks/use-contacts-store";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateDisplayName = useAuthStore((s) => s.updateDisplayName);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [displayNameDraft, setDisplayNameDraft] = useState("");

  const contacts = useContactsStore((s) => s.contacts);
  const isDiscoverable = useContactsStore((s) => s.isDiscoverable);
  const loadContacts = useContactsStore((s) => s.loadContacts);
  const toggleLocationSharing = useContactsStore(
    (s) => s.toggleLocationSharing,
  );
  const toggleDiscoverability = useContactsStore(
    (s) => s.toggleDiscoverability,
  );

  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "error");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const inputBackgroundColor = useThemeColor({}, "inputBackground");
  const textColor = useThemeColor({}, "text");
  const textInverseColor = useThemeColor({}, "textInverse");
  const tintColor = useThemeColor({}, "tint");

  const isDisplayNameDirty = useMemo(() => {
    const currentDisplayName = user?.displayName ?? "";
    return displayNameDraft.trim() !== currentDisplayName;
  }, [displayNameDraft, user?.displayName]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    setDisplayNameDraft(user?.displayName ?? "");
  }, [user?.displayName]);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Log out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleSaveDisplayName = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateDisplayName(displayNameDraft);
      Alert.alert(
        "Perfil actualizado",
        "Tu nombre se actualizó correctamente.",
      );
    } catch (error) {
      Alert.alert(
        "No se pudo actualizar",
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar el nombre.",
      );
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title">Profile</ThemedText>
          </View>

          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.avatar}
                contentFit="contain"
              />
            </View>
            {user ? (
              <>
                <ThemedText type="subtitle">{user.displayName}</ThemedText>
                <ThemedText style={styles.emailText}>{user.email}</ThemedText>
              </>
            ) : null}
          </View>

          <View style={styles.section}>
            <View
              style={[
                styles.card,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <View style={styles.row}>
                <ThemedText style={styles.label}>Display name</ThemedText>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  value={displayNameDraft}
                  onChangeText={setDisplayNameDraft}
                  placeholder="Tu nombre"
                  placeholderTextColor={textSecondaryColor}
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBackgroundColor,
                      borderColor,
                      color: textColor,
                    },
                  ]}
                />
                <Pressable
                  onPress={handleSaveDisplayName}
                  disabled={!isDisplayNameDirty || isLoading}
                  style={({ pressed }) => [
                    styles.saveButton,
                    {
                      backgroundColor: tintColor,
                      opacity:
                        !isDisplayNameDirty || isLoading
                          ? 0.5
                          : pressed
                            ? 0.8
                            : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.saveButtonText, { color: textInverseColor }]}
                  >
                    Guardar
                  </ThemedText>
                </Pressable>
              </View>
              <View
                style={[styles.divider, { backgroundColor: borderColor }]}
              />
              <View style={styles.row}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <ThemedText style={styles.value}>
                  {user?.email ?? "—"}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Privacy
            </ThemedText>
            <View
              style={[
                styles.card,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <ThemedText style={styles.label}>Discoverable</ThemedText>
                  <ThemedText style={styles.switchHint}>
                    Other users can find you by searching
                  </ThemedText>
                </View>
                <Switch
                  value={isDiscoverable}
                  onValueChange={toggleDiscoverability}
                  trackColor={{ true: tintColor }}
                />
              </View>
            </View>
          </View>

          {contacts.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Location sharing
              </ThemedText>
              <View
                style={[
                  styles.card,
                  { backgroundColor: surfaceColor, borderColor },
                ]}
              >
                {contacts.map((contact, index) => (
                  <View key={contact.userId}>
                    {index > 0 ? (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: borderColor },
                        ]}
                      />
                    ) : null}
                    <View style={styles.switchRow}>
                      <ThemedText style={styles.label} numberOfLines={1}>
                        {contact.displayName ?? contact.userId}
                      </ThemedText>
                      <Switch
                        value={contact.isLocationShared}
                        onValueChange={() =>
                          toggleLocationSharing(
                            contact.userId,
                            !contact.isLocationShared,
                          )
                        }
                        trackColor={{ true: tintColor }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Pressable
              onPress={handleLogout}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.logoutButton,
                { borderColor: errorColor },
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={[styles.logoutText, { color: errorColor }]}>
                {isLoading ? "Logging out..." : "Log Out"}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatarSection: {
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: Radii.round,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  avatar: {
    width: 64,
    height: 64,
  },
  emailText: {
    opacity: 0.5,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
  },
  saveButton: {
    minHeight: 44,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  saveButtonText: {
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  switchLabel: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  switchHint: {
    fontSize: 12,
    opacity: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontWeight: "500",
  },
  value: {
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.error,
  },
});
