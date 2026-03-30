import type { Coordinates } from "@/src/domain/entities/location";

type LocationPermissionStatus =
  | "undetermined"
  | "foreground"
  | "background"
  | "denied";

type LocationTrackingService = {
  requestPermissions: () => Promise<LocationPermissionStatus>;
  startBackgroundTracking: () => Promise<void>;
  stopBackgroundTracking: () => Promise<void>;
  isBackgroundTrackingActive: () => Promise<boolean>;
  watchForegroundPosition: (
    callback: (coordinates: Coordinates) => void,
  ) => Promise<() => void>;
};

export type { LocationPermissionStatus, LocationTrackingService };

