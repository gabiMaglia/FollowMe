import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing } from "@/constants/theme";
import { useContactsStore } from "@/hooks/use-contacts-store";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { useThemeColor } from "@/hooks/use-theme-color";

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    contactId?: string | string[];
    displayName?: string | string[];
  }>();
  const contactId = Array.isArray(params.contactId)
    ? (params.contactId[0] ?? "")
    : typeof params.contactId === "string"
      ? params.contactId
      : "";
  const displayNameParam = Array.isArray(params.displayName)
    ? (params.displayName[0] ?? "")
    : typeof params.displayName === "string"
      ? params.displayName
      : "";

  const contacts = useContactsStore((s) => s.contacts);
  const conversation = useMessagesStore((s) => s.conversations[contactId]);
  const ensureConversation = useMessagesStore((s) => s.ensureConversation);
  const sendMessage = useMessagesStore((s) => s.sendMessage);
  const [messageText, setMessageText] = useState("");

  const borderColor = useThemeColor({}, "border");
  const surfaceColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const textColor = useThemeColor({}, "text");
  const inputBackgroundColor = useThemeColor({}, "inputBackground");
  const textInverseColor = useThemeColor({}, "textInverse");

  const resolvedDisplayName = useMemo(() => {
    const contact = contacts.find((item) => item.userId === contactId);
    const displayNameFromParam = displayNameParam.trim();
    return (
      contact?.displayName ??
      conversation?.displayName ??
      (displayNameFromParam.length > 0 ? displayNameFromParam : undefined) ??
      contactId
    );
  }, [contactId, contacts, conversation?.displayName, displayNameParam]);

  useEffect(() => {
    if (!contactId || !resolvedDisplayName) {
      return;
    }
    ensureConversation(contactId, resolvedDisplayName);
  }, [contactId, ensureConversation, resolvedDisplayName]);

  const messages = conversation?.messages ?? [];

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!contactId || trimmed.length === 0) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(contactId, resolvedDisplayName, trimmed);
    setMessageText("");
  };

  if (!contactId) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={["top"]}>
          <View style={styles.header}>
            <ThemedText type="title">Chat</ThemedText>
          </View>
          <View style={styles.emptyRouteContainer}>
            <ThemedText
              style={[styles.emptyText, { color: textSecondaryColor }]}
            >
              No se encontro el contacto para abrir este chat.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.header}>
          <ThemedText type="title" numberOfLines={1}>
            {resolvedDisplayName || "Chat"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textSecondaryColor }]}>
            {contactId}
          </ThemedText>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContent}
            ListEmptyComponent={
              <ThemedText
                style={[styles.emptyText, { color: textSecondaryColor }]}
              >
                Escribí tu primer mensaje.
              </ThemedText>
            }
            renderItem={({ item }) => {
              const isOwnMessage = item.sender === "ME";
              return (
                <View
                  style={[
                    styles.messageRow,
                    isOwnMessage ? styles.ownRow : styles.contactRow,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: isOwnMessage
                          ? primaryColor
                          : surfaceColor,
                        borderColor,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.messageText,
                        { color: isOwnMessage ? textInverseColor : textColor },
                      ]}
                    >
                      {item.text}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.messageTime,
                        {
                          color: isOwnMessage
                            ? textInverseColor
                            : textSecondaryColor,
                        },
                      ]}
                    >
                      {formatTimestamp(item.createdAt)}
                    </ThemedText>
                  </View>
                </View>
              );
            }}
          />

          <View
            style={[
              styles.inputRow,
              { borderColor, backgroundColor: surfaceColor },
            ]}
          >
            <TextInput
              placeholder="Escribí un mensaje"
              placeholderTextColor={textSecondaryColor}
              value={messageText}
              onChangeText={setMessageText}
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor,
                  backgroundColor: inputBackgroundColor,
                },
              ]}
            />
            <Pressable
              onPress={handleSend}
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: primaryColor, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <ThemedText
                style={[styles.sendButtonText, { color: textInverseColor }]}
              >
                Enviar
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
    gap: Spacing.xxs,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  messagesContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.xl,
    opacity: 0.7,
  },
  emptyRouteContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  messageRow: {
    width: "100%",
    flexDirection: "row",
  },
  ownRow: {
    justifyContent: "flex-end",
  },
  contactRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xxs,
  },
  messageText: {
    fontSize: 15,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.8,
    textAlign: "right",
  },
  inputRow: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    minHeight: 44,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  sendButtonText: {
    fontWeight: "600",
  },
});
