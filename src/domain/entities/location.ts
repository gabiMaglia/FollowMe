type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationUpdate = {
  coordinates: Coordinates;
  accuracy: number;
  timestamp: number;
};

type ContactLocation = {
  userId: string;
  displayName: string;
  coordinates: Coordinates;
  timestamp: number;
};

export type { ContactLocation, Coordinates, LocationUpdate };

