import { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    ContactCard,
    IncomingRequestCard,
    SentRequestCard,
} from "@/components/contact-card";
import { ContactSearchInput } from "@/components/contact-search-input";
import { SearchContactCard } from "@/components/search-contact-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useContactsStore } from "@/hooks/use-contacts-store";
import { useThemeColor } from "@/hooks/use-theme-color";

export const ContactsScreen = () => {
  const {
    contacts,
    sentRequests,
    incomingRequests,
    searchResults,
    searchQuery,
    isLoadingContacts,
    isLoadingSearch,
    isLoadingAction,
    loadContacts,
    loadSentRequests,
    loadIncomingRequests,
    searchUsers,
    sendRequest,
    cancelRequest,
    acceptRequest,
    rejectRequest,
    removeContact,
    setSearchQuery,
  } = useContactsStore();

  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");

  useEffect(() => {
    loadContacts();
    loadSentRequests();
    loadIncomingRequests();
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    searchUsers(text);
  };

  const isSearching = searchQuery.trim().length >= 2;

  const handleRemoveContact = (userId: string) => {
    Alert.alert(
      "Eliminar contacto",
      "¿Querés eliminar este contacto? Se perderá la conexión mutua.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeContact(userId),
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <View style={styles.header}>
          <ThemedText type="title">Contactos</ThemedText>
        </View>

        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Search section */}
              <View style={styles.section}>
                <ThemedText type="subtitle">Buscar contactos</ThemedText>
                <ContactSearchInput
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                />

                {isLoadingSearch && (
                  <ActivityIndicator
                    size="small"
                    color={primaryColor}
                    style={styles.loader}
                  />
                )}

                {isSearching &&
                  !isLoadingSearch &&
                  searchResults.length === 0 && (
                    <ThemedText
                      style={[styles.emptyText, { color: textSecondaryColor }]}
                    >
                      No se encontraron usuarios
                    </ThemedText>
                  )}

                {searchResults.map((result) => (
                  <SearchContactCard
                    key={result.userId}
                    userId={result.userId}
                    displayName={result.displayName}
                    connectionStatus={result.connectionStatus}
                    onSendRequest={sendRequest}
                    disabled={isLoadingAction}
                  />
                ))}
              </View>

              {/* Incoming requests */}
              {incomingRequests.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="subtitle">
                    Solicitudes recibidas ({incomingRequests.length})
                  </ThemedText>
                  {incomingRequests.map((request) => (
                    <IncomingRequestCard
                      key={request.fromUserId}
                      userId={request.fromUserId}
                      displayName={request.displayName ?? request.fromUserId}
                      onAccept={acceptRequest}
                      onReject={rejectRequest}
                      disabled={isLoadingAction}
                    />
                  ))}
                </View>
              )}

              {/* Sent requests */}
              {sentRequests.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="subtitle">
                    Solicitudes enviadas ({sentRequests.length})
                  </ThemedText>
                  {sentRequests.map((request) => (
                    <SentRequestCard
                      key={request.fromUserId}
                      userId={request.fromUserId}
                      displayName={request.displayName ?? request.fromUserId}
                      onCancel={cancelRequest}
                      disabled={isLoadingAction}
                    />
                  ))}
                </View>
              )}

              {/* My contacts */}
              <View style={styles.section}>
                <ThemedText type="subtitle">
                  Mis contactos ({contacts.length})
                </ThemedText>

                {isLoadingContacts && (
                  <ActivityIndicator
                    size="small"
                    color={primaryColor}
                    style={styles.loader}
                  />
                )}

                {!isLoadingContacts && contacts.length === 0 && (
                  <ThemedText
                    style={[styles.emptyText, { color: textSecondaryColor }]}
                  >
                    Aún no tenés contactos. Buscá personas para agregar.
                  </ThemedText>
                )}

                {contacts.map((contact) => (
                  <ContactCard
                    key={contact.userId}
                    userId={contact.userId}
                    displayName={contact.displayName ?? contact.userId}
                    isLocationShared={contact.isLocationShared}
                    theyShareLocation={contact.theyShareLocation}
                    onRemove={handleRemoveContact}
                    disabled={isLoadingAction}
                  />
                ))}
              </View>
            </>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
};

// eslint-disable-next-line import/no-default-export
export default ContactsScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  loader: {
    paddingVertical: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: Spacing.lg,
    opacity: 0.6,
  },
});
