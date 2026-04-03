import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ContactAvatar } from "@/components/search-contact-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing } from "@/constants/theme";
import { useContactsStore } from "@/hooks/use-contacts-store";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function NewMessageScreen() {
  const router = useRouter();
  const contacts = useContactsStore((s) => s.contacts);
  const loadContacts = useContactsStore((s) => s.loadContacts);
  const ensureConversation = useMessagesStore((s) => s.ensureConversation);
  const borderColor = useThemeColor({}, "border");
  const surfaceColor = useThemeColor({}, "surface");
  const textSecondaryColor = useThemeColor({}, "textSecondary");

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const openChat = (contactId: string, displayName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    ensureConversation(contactId, displayName);
    router.push({
      pathname: "/messages/[contactId]",
      params: { contactId, displayName },
    });
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.header}>
          <ThemedText type="title">Nuevo mensaje</ThemedText>
          <ThemedText style={[styles.subtitle, { color: textSecondaryColor }]}>
            Elegí un contacto para abrir el chat.
          </ThemedText>
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText
              style={[styles.emptyText, { color: textSecondaryColor }]}
            >
              No hay contactos disponibles.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const displayName = item.displayName ?? item.userId;
            return (
              <Pressable
                onPress={() => openChat(item.userId, displayName)}
                style={({ pressed }) => [
                  styles.contactCard,
                  {
                    borderColor,
                    backgroundColor: surfaceColor,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <ContactAvatar displayName={displayName} />
                <View style={styles.contactInfo}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {displayName}
                  </ThemedText>
                  <ThemedText
                    style={[styles.contactId, { color: textSecondaryColor }]}
                    numberOfLines={1}
                  >
                    {item.userId}
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
    gap: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.xl,
    opacity: 0.7,
  },
  contactCard: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  contactInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  contactId: {
    fontSize: 12,
  },
});
