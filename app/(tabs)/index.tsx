import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);

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
      <SafeAreaView style={styles.flex}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title">FollowMe</ThemedText>
            {user ? (
              <ThemedText style={styles.greeting}>
                Hey, {user.displayName}!
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.placeholder}>
              Main screen — more features coming soon
            </ThemedText>
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={handleLogout}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.logoutText}>
                {isLoading ? "Logging out..." : "Log Out"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  greeting: {
    opacity: 0.6,
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    opacity: 0.4,
    fontSize: 16,
  },
  footer: {
    paddingBottom: 16,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
