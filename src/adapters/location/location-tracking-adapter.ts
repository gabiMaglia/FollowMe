import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { LOCATION_TASK_NAME } from "@/src/adapters/location/background-location-task";
import type { Coordinates } from "@/src/domain/entities/location";
import type {
    LocationPermissionStatus,
    LocationTrackingService,
} from "@/src/ports/outbound/location-tracking-service";

const createLocationTrackingService = (): LocationTrackingService => ({
  requestPermissions: async (): Promise<LocationPermissionStatus> => {
    try {
      // Step 1: Request foreground permission first
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        return "denied";
      }

      // Step 2: Try background permission — may fail in Expo Go
      try {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus === "granted") {
          return "background";
        }
      } catch {
        // Background permissions not available (e.g. Expo Go)
        console.warn(
          "[Location] Background permissions unavailable, foreground only",
        );
      }

      return "foreground";
    } catch {
      // Foreground permissions failed entirely
      console.warn("[Location] Could not request location permissions");
      return "denied";
    }
  },

  startBackgroundTracking: async (): Promise<void> => {
    try {
      const isRegistered =
        await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

      if (isRegistered) return;

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 10,
        timeInterval: 15_000,
        deferredUpdatesInterval: 15_000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "FollowMe",
          notificationBody: "Compartiendo tu ubicación con tus contactos",
          notificationColor: "#3B82F6",
        },
      });
    } catch {
      console.warn("[Location] Background tracking not available");
    }
  },

  stopBackgroundTracking: async (): Promise<void> => {
    try {
      const isRegistered =
        await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

      if (!isRegistered) return;

      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch {
      console.warn("[Location] Could not stop background tracking");
    }
  },

  isBackgroundTrackingActive: async (): Promise<boolean> => {
    try {
      return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    } catch {
      return false;
    }
  },

  watchForegroundPosition: async (
    callback: (coordinates: Coordinates) => void,
  ): Promise<() => void> => {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5_000,
        distanceInterval: 5,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      },
    );

    return () => subscription.remove();
  },
});

export { createLocationTrackingService };

