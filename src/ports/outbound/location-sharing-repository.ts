import type {
    ContactLocation,
    Coordinates,
} from "@/src/domain/entities/location";

type LocationSharingRepository = {
  sendLocationUpdate: (coordinates: Coordinates) => Promise<void>;
  getContactLocations: () => Promise<ContactLocation[]>;
};

export type { LocationSharingRepository };
