import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FollowMeMap } from "@/components/follow-me-map";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/theme";
import { useMapTracking } from "@/hooks/use-map-tracking";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function MapScreen() {
  const {
    userLocation,
    contacts,
    isTracking,
    permissionStatus,
    hasBackgroundPermission,
    sendCurrentLocation,
  } = useMapTracking();
  const textSecondary = useThemeColor({}, "textSecondary");

  if (permissionStatus === "denied") {
    return (
      <ThemedView style={styles.centered}>
        <SafeAreaView style={styles.centered}>
          <ThemedText type="subtitle">Location Required</ThemedText>
          <ThemedText style={[styles.deniedText, { color: textSecondary }]}>
            FollowMe needs access to your location to show you on the map.
            Please enable location permissions in your device settings.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!isTracking) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <FollowMeMap userLocation={userLocation} contacts={contacts} />
      <Pressable style={styles.sendButton} onPress={sendCurrentLocation}>
        <ThemedText style={styles.sendButtonText}>Enviar ubicación</ThemedText>
      </Pressable>
      {!hasBackgroundPermission ? (
        <SafeAreaView style={styles.banner} edges={["bottom"]}>
          <View style={styles.bannerContent}>
            <ThemedText style={styles.bannerText}>
              Activa la ubicación en segundo plano para que tus contactos te
              vean siempre
            </ThemedText>
          </View>
        </SafeAreaView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  deniedText: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  banner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerContent: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bannerText: {
    fontSize: 13,
    textAlign: "center",
    color: "#000",
  },
  sendButton: {
    position: "absolute",
    top: 60,
    right: Spacing.md,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sendButtonText: {
    color: Colors.light.background,
    fontWeight: "600",
    fontSize: 14,
  },
});
