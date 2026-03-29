import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FollowMeMap } from "@/components/follow-me-map";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useMapTracking } from "@/hooks/use-map-tracking";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function MapScreen() {
  const { userLocation, contacts, isTracking, permissionDenied } =
    useMapTracking();
  const textSecondary = useThemeColor({}, "textSecondary");

  if (permissionDenied) {
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
});
