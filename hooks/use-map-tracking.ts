import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuthStore } from "@/hooks/use-auth-store";
import { useContactsStore } from "@/hooks/use-contacts-store";
import { createApiClient } from "@/src/adapters/api/api-client";
import { createLocationApiAdapter } from "@/src/adapters/api/location-api-adapter";
import { createLocationTrackingService } from "@/src/adapters/location/location-tracking-adapter";
import { createSocketRealtimeService } from "@/src/adapters/realtime/socket-realtime-service";
import { createSecureTokenStorage } from "@/src/adapters/storage/secure-token-storage";
import type {
    ContactLocation,
    Coordinates,
} from "@/src/domain/entities/location";
import type { LocationPermissionStatus } from "@/src/ports/outbound/location-tracking-service";

type MapState = {
  userLocation: Coordinates | null;
  contacts: Map<string, ContactLocation>;
  isTracking: boolean;
  permissionStatus: LocationPermissionStatus;
};

const tokenStorage = createSecureTokenStorage();
const apiClient = createApiClient(tokenStorage, {
  onTokensRefreshed: () => {},
  onRefreshFailed: () => {},
});
const locationApi = createLocationApiAdapter(apiClient);
const locationService = createLocationTrackingService();
const realtimeService = createSocketRealtimeService();

export const useMapTracking = () => {
  const user = useAuthStore((s) => s.user);
  const contacts = useContactsStore((s) => s.contacts);
  const loadContacts = useContactsStore((s) => s.loadContacts);
  const [state, setState] = useState<MapState>({
    userLocation: null,
    contacts: new Map(),
    isTracking: false,
    permissionStatus: "undetermined",
  });
  const foregroundCleanupRef = useRef<(() => void) | null>(null);

  const contactNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const contact of contacts) {
      if (contact.displayName?.trim()) {
        map.set(contact.userId, contact.displayName);
      }
    }
    return map;
  }, [contacts]);

  const resolveDisplayName = useCallback(
    (userId: string, fallbackName: string) => {
      const knownName = contactNameById.get(userId);
      if (knownName) {
        return knownName;
      }

      if (fallbackName.trim().length === 0) {
        return userId;
      }

      return fallbackName;
    },
    [contactNameById],
  );

  const startTracking = useCallback(async () => {
    const status = await locationService.requestPermissions();
    setState((prev) => ({ ...prev, permissionStatus: status }));

    if (status === "denied") return;

    // Start background tracking if we have background permission
    if (status === "background") {
      await locationService.startBackgroundTracking();
    }

    setState((prev) => ({ ...prev, isTracking: true }));
  }, []);

  const stopTracking = useCallback(async () => {
    await locationService.stopBackgroundTracking();
    foregroundCleanupRef.current?.();
    foregroundCleanupRef.current = null;
    realtimeService.disconnect();
    setState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  // Foreground location watching — updates local UI position
  useEffect(() => {
    if (!state.isTracking) return;

    let cleanup: (() => void) | null = null;

    const start = async () => {
      cleanup = await locationService.watchForegroundPosition((coordinates) => {
        setState((prev) => ({ ...prev, userLocation: coordinates }));

        // Send via WebSocket for real-time push
        realtimeService.sendLocationUpdate(coordinates);

        // Also persist via REST POST /location
        locationApi.sendLocationUpdate(coordinates).catch((err) => {
          console.warn("[MapTracking] REST POST /location failed:", err);
        });
      });
      foregroundCleanupRef.current = cleanup;
    };

    start();

    return () => {
      cleanup?.();
      foregroundCleanupRef.current = null;
    };
  }, [state.isTracking]);

  // WebSocket for real-time contact location updates
  useEffect(() => {
    if (!state.isTracking || !user) return;

    const connectWebSocket = async () => {
      const tokens = await tokenStorage.getTokens();
      if (!tokens) return;
      realtimeService.connect(tokens.accessToken);
    };

    connectWebSocket();

    const unsubscribe = realtimeService.onContactLocationUpdate((contact) => {
      setState((prev) => {
        const next = new Map(prev.contacts);
        next.set(contact.userId, {
          ...contact,
          displayName: resolveDisplayName(contact.userId, contact.displayName),
        });
        return { ...prev, contacts: next };
      });
    });

    return () => {
      unsubscribe();
      realtimeService.disconnect();
    };
  }, [resolveDisplayName, state.isTracking, user]);

  // Fetch last known contact locations on startup (covers offline contacts)
  useEffect(() => {
    if (!state.isTracking || !user) return;

    const fetchContactLocations = async () => {
      try {
        const contactLocations = await locationApi.getContactLocations();
        console.log(
          "[MapTracking] Fetched contact locations:",
          contactLocations.length,
          contactLocations,
        );
        setState((prev) => {
          const next = new Map(prev.contacts);
          for (const contact of contactLocations) {
            const normalizedContact = {
              ...contact,
              displayName: resolveDisplayName(
                contact.userId,
                contact.displayName,
              ),
            };
            // Only set if we don't already have a more recent WS update
            const existing = next.get(normalizedContact.userId);
            if (!existing || existing.timestamp < normalizedContact.timestamp) {
              next.set(normalizedContact.userId, normalizedContact);
            }
          }
          return { ...prev, contacts: next };
        });
      } catch (error) {
        console.warn("[MapTracking] Failed to fetch contact locations:", error);
        // Silently fail — contacts will populate via WebSocket
      }
    };

    fetchContactLocations();

    // Periodically refresh to catch offline contacts' last locations
    const interval = setInterval(fetchContactLocations, 60_000);

    return () => clearInterval(interval);
  }, [resolveDisplayName, state.isTracking, user]);

  // Load contacts so map can resolve names by userId.
  useEffect(() => {
    if (!user) {
      return;
    }
    loadContacts();
  }, [loadContacts, user]);

  // Re-map already received locations when contact names are refreshed.
  useEffect(() => {
    setState((prev) => {
      if (prev.contacts.size === 0) {
        return prev;
      }

      const next = new Map<string, ContactLocation>();
      prev.contacts.forEach((contact, userId) => {
        next.set(userId, {
          ...contact,
          displayName: resolveDisplayName(userId, contact.displayName),
        });
      });

      return { ...prev, contacts: next };
    });
  }, [resolveDisplayName]);

  // Auto-start tracking when user is authenticated
  useEffect(() => {
    if (user?.onboardingCompleted) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [user?.onboardingCompleted, startTracking, stopTracking]);

  const contactsList = Array.from(state.contacts.values());

  const sendCurrentLocation = useCallback(async () => {
    if (!state.userLocation) {
      console.warn("[MapTracking] No user location to send");
      return;
    }
    try {
      console.log(
        "[MapTracking] Sending location manually:",
        state.userLocation,
      );
      await locationApi.sendLocationUpdate(state.userLocation);
      console.log("[MapTracking] Manual POST /location success");
    } catch (error) {
      console.error("[MapTracking] Manual POST /location failed:", error);
    }
  }, [state.userLocation]);

  return {
    userLocation: state.userLocation,
    contacts: contactsList,
    isTracking: state.isTracking,
    permissionStatus: state.permissionStatus,
    hasBackgroundPermission: state.permissionStatus === "background",
    startTracking,
    stopTracking,
    sendCurrentLocation,
  };
};
