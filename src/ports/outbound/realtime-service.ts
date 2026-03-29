import type { ContactLocation } from "@/src/domain/entities/location";

type RealtimeService = {
  connect: (token: string) => void;
  disconnect: () => void;
  onContactLocationUpdate: (
    callback: (contact: ContactLocation) => void,
  ) => () => void;
  isConnected: () => boolean;
};

export type { RealtimeService };
