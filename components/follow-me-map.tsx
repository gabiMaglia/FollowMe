import { memo, useCallback, useEffect, useRef, useState } from "react";
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
  contacts?: ContactLocation[];
};

type AndroidLabelPosition = {
  userId: string;
  displayName: string;
  x: number;
  y: number;
};

const DEFAULT_REGION = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const FOLLOW_DELTA = 0.01;
const ONLINE_THRESHOLD_MS = 5 * 60 * 1_000;

const ContactMarkerComponent = ({ contact }: { contact: ContactLocation }) => {
  const isOnline = Date.now() - contact.timestamp < ONLINE_THRESHOLD_MS;
  const dotColor = isOnline ? Colors.light.primary : Colors.light.textSecondary;

  if (Platform.OS === "android") {
    return (
      <Marker
        coordinate={contact.coordinates}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        <View style={[styles.androidDot, { backgroundColor: dotColor }]} />
      </Marker>
    );
  }

  return (
    <Marker
      coordinate={contact.coordinates}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges
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

const AndroidContactLabels = ({
  contacts,
  mapRef,
  refreshTick,
}: {
  contacts: ContactLocation[];
  mapRef: React.RefObject<MapView | null>;
  refreshTick: number;
}) => {
  const [labelPositions, setLabelPositions] = useState<AndroidLabelPosition[]>(
    [],
  );

  const refreshLabelPositions = useCallback(async () => {
    const map = mapRef.current;

    if (!map || contacts.length === 0) {
      setLabelPositions([]);
      return;
    }

    const nextPositions = await Promise.all(
      contacts.map(async (contact) => {
        const point = await map.pointForCoordinate(contact.coordinates);

        return {
          userId: contact.userId,
          displayName: contact.displayName,
          x: point.x,
          y: point.y,
        } satisfies AndroidLabelPosition;
      }),
    );

    setLabelPositions(nextPositions);
  }, [contacts, mapRef]);

  useEffect(() => {
    refreshLabelPositions().catch(() => {
      setLabelPositions([]);
    });
  }, [refreshLabelPositions, refreshTick]);

  if (labelPositions.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.androidLabelsOverlay}>
      {labelPositions.map((label) => (
        <View
          key={label.userId}
          style={[
            styles.androidLabelContainer,
            {
              left: label.x,
              top: label.y,
            },
          ]}
        >
          <View style={styles.nameTag}>
            <Text style={styles.nameText} numberOfLines={1}>
              {label.displayName}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export const FollowMeMap = ({
  userLocation,
  contacts = [],
}: FollowMeMapProps) => {
  const borderColor = useThemeColor({}, "border");
  const mapRef = useRef<MapView | null>(null);
  const [androidRefreshTick, setAndroidRefreshTick] = useState(0);

  const region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: FOLLOW_DELTA,
        longitudeDelta: FOLLOW_DELTA,
      }
    : DEFAULT_REGION;

  const handleRefreshAndroidLabels = useCallback(() => {
    if (Platform.OS !== "android") {
      return;
    }

    setAndroidRefreshTick((currentValue) => currentValue + 1);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        region={userLocation ? region : undefined}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
        showsCompass
        onMapReady={handleRefreshAndroidLabels}
        onRegionChangeComplete={handleRefreshAndroidLabels}
      >
        {contacts.map((contact) => (
          <ContactMarker key={contact.userId} contact={contact} />
        ))}
      </MapView>

      {Platform.OS === "android" ? (
        <AndroidContactLabels
          contacts={contacts}
          mapRef={mapRef}
          refreshTick={androidRefreshTick}
        />
      ) : null}

      {!userLocation ? (
        <View style={[styles.overlay, { borderColor }]}>
          <ThemedText style={styles.overlayText}>
            Waiting for location...
          </ThemedText>
        </View>
      ) : null}
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
  androidLabelsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  androidLabelContainer: {
    position: "absolute",
    transform: [{ translateX: -40 }, { translateY: -28 }],
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
  androidDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
});
