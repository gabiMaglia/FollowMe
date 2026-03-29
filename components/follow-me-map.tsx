import { memo } from "react";
import { StyleSheet, View } from "react-native";
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

const ContactMarkerComponent = ({ contact }: { contact: ContactLocation }) => (
  <Marker
    coordinate={contact.coordinates}
    title={contact.displayName}
    pinColor={Colors.light.primary}
  />
);
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
});
