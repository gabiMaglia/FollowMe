import type {
    ContactLocation,
    Coordinates,
} from "@/src/domain/entities/location";

type RealtimeService = {
  connect: (token: string) => void;
  disconnect: () => void;
  sendLocationUpdate: (coordinates: Coordinates) => void;
  onContactLocationUpdate: (
    callback: (contact: ContactLocation) => void,
  ) => () => void;
  isConnected: () => boolean;
};

export type { RealtimeService };
