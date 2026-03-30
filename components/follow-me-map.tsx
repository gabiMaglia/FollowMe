import { memo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import type {
    ContactLocation,
    Coordinates,
} from "@/src/domain/entities/location";

type FollowMeMapProps = {
  userLocation: Coordinates | null;
  contacts: ContactLocation[];
};

const DEFAULT_REGION = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 90,
  longitudeDelta: 90,
};

const FOLLOW_DELTA = 0.01;

const ONLINE_THRESHOLD_MS = 5 * 60 * 1_000; // 5 minutes

const formatTimeAgo = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
};

const ContactMarkerComponent = ({ contact }: { contact: ContactLocation }) => {
  const isOnline = Date.now() - contact.timestamp < ONLINE_THRESHOLD_MS;
  const dotColor = isOnline ? Colors.light.primary : Colors.light.textSecondary;

  return (
    <Marker
      coordinate={contact.coordinates}
      tracksViewChanges={Platform.OS === "ios"}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerWrapper}>
        <View style={styles.nameTag}>
          <Text style={styles.nameText} numberOfLines={1}>
            {contact.displayName}
          </Text>
        </View>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>
    </Marker>
  );
};
ContactMarkerComponent.displayName = "ContactMarker";
const ContactMarker = memo(ContactMarkerComponent);

export const FollowMeMap = ({
  userLocation,
  contacts = [],
}: FollowMeMapProps) => {
  const borderColor = useThemeColor({}, "border");

  const region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: FOLLOW_DELTA,
        longitudeDelta: FOLLOW_DELTA,
      }
    : DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        region={userLocation ? region : undefined}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
        showsCompass
      >
        {contacts.map((contact) => (
          <ContactMarker key={contact.userId} contact={contact} />
        ))}
      </MapView>

      {!userLocation && (
        <View style={[styles.overlay, { borderColor }]}>
          <ThemedText style={styles.overlayText}>
            Waiting for location...
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  overlayText: {
    opacity: 0.6,
    padding: Spacing.md,
  },
  markerWrapper: {
    alignItems: "center",
  },
  nameTag: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  nameText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
    maxWidth: 100,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
});
