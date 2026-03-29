import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);

  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "error");

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Log out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
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
                <ThemedText style={styles.value}>
                  {user?.displayName ?? "—"}
                </ThemedText>
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
