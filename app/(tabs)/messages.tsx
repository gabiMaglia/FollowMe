import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ContactAvatar } from "@/components/search-contact-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing } from "@/constants/theme";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { useThemeColor } from "@/hooks/use-theme-color";

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MessagesScreen() {
  const router = useRouter();
  const borderColor = useThemeColor({}, "border");
  const surfaceColor = useThemeColor({}, "surface");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const conversationsMap = useMessagesStore((s) => s.conversations);

  const conversations = useMemo(() => {
    return Object.values(conversationsMap).sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
  }, [conversationsMap]);

  const handleOpenChat = (contactId: string, displayName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: `/messages/${contactId}`,
      params: { displayName },
    });
  };

  const handleNewMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/messages/new");
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.header}>
          <ThemedText type="title">Messages</ThemedText>
          <Pressable
            onPress={handleNewMessage}
            style={({ pressed }) => [
              styles.newButton,
              { backgroundColor: primaryColor, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={styles.newButtonText}>Nuevo mensaje</ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.contactId}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <ThemedText
              style={[styles.placeholderText, { color: textSecondaryColor }]}
            >
              Aun no tenes conversaciones. Toca Nuevo mensaje para empezar.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const lastMessage = item.messages[item.messages.length - 1];
            return (
              <Pressable
                onPress={() => handleOpenChat(item.contactId, item.displayName)}
                style={({ pressed }) => [
                  styles.chatCard,
                  {
                    borderColor,
                    backgroundColor: surfaceColor,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <ContactAvatar displayName={item.displayName} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatRow}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {item.displayName}
                    </ThemedText>
                    <ThemedText
                      style={[styles.chatTime, { color: textSecondaryColor }]}
                    >
                      {formatTime(item.updatedAt)}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.chatPreview, { color: textSecondaryColor }]}
                    numberOfLines={1}
                  >
                    {lastMessage?.text ?? "Sin mensajes todavía"}
                  </ThemedText>
                </View>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.sm,
  },
  newButton: {
    minHeight: 44,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  newButtonText: {
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  placeholderText: {
    textAlign: "center",
    marginTop: Spacing.xl,
    opacity: 0.7,
  },
  chatCard: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 72,
  },
  chatInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  chatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.sm,
  },
  chatTime: {
    fontSize: 12,
  },
  chatPreview: {
    fontSize: 13,
  },
});
