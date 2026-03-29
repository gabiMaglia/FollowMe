import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

import { useAuthStore } from "@/hooks/use-auth-store";
import { createSocketRealtimeService } from "@/src/adapters/realtime/socket-realtime-service";
import { createSecureTokenStorage } from "@/src/adapters/storage/secure-token-storage";
import type {
    ContactLocation,
    Coordinates,
} from "@/src/domain/entities/location";

type MapState = {
  userLocation: Coordinates | null;
  contacts: Map<string, ContactLocation>;
  isTracking: boolean;
  permissionDenied: boolean;
};

const realtimeService = createSocketRealtimeService();
const tokenStorage = createSecureTokenStorage();

export const useMapTracking = () => {
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<MapState>({
    userLocation: null,
    contacts: new Map(),
    isTracking: false,
    permissionDenied: false,
  });

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setState((prev) => ({ ...prev, permissionDenied: true }));
      return;
    }

    setState((prev) => ({ ...prev, isTracking: true }));
  }, []);

  const stopTracking = useCallback(() => {
    realtimeService.disconnect();
    setState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  // Watch device location via expo-location
  useEffect(() => {
    if (!state.isTracking) return;

    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5_000,
          distanceInterval: 5,
        },
        (location) => {
          setState((prev) => ({
            ...prev,
            userLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          }));
        },
      );
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, [state.isTracking]);

  // WebSocket connection for contact locations
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
        next.set(contact.userId, contact);
        return { ...prev, contacts: next };
      });
    });

    return () => {
      unsubscribe();
      realtimeService.disconnect();
    };
  }, [state.isTracking, user]);

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

  return {
    userLocation: state.userLocation,
    contacts: contactsList,
    isTracking: state.isTracking,
    permissionDenied: state.permissionDenied,
    startTracking,
    stopTracking,
  };
};
