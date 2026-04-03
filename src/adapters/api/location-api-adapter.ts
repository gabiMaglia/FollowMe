import type { AxiosInstance } from "axios";

import type { ContactLocation } from "@/src/domain/entities/location";
import type { LocationSharingRepository } from "@/src/ports/outbound/location-sharing-repository";

const createLocationApiAdapter = (
  client: AxiosInstance,
): LocationSharingRepository => ({
  sendLocationUpdate: async (coordinates) => {
    await client.post("/location/update", {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });
  },

  getContactLocations: async (): Promise<ContactLocation[]> => {
    const { data } = await client.get("/location/contacts");
    console.log("[LocationAPI] Raw response:", JSON.stringify(data));

    if (!Array.isArray(data)) return [];

    const mapped = data.map((item: Record<string, unknown>) => {
      const userId = String(item.userId ?? item.id ?? "");
      const displayNameRaw =
        (typeof item.displayName === "string" && item.displayName) ||
        (typeof item.display_name === "string" && item.display_name) ||
        (typeof item.name === "string" && item.name) ||
        userId;
      const timestamp =
        typeof item.timestamp === "number"
          ? item.timestamp
          : item.updatedAt
            ? new Date(String(item.updatedAt)).getTime()
            : Date.now();
      const mappedContact = {
        userId,
        displayName: displayNameRaw,
        coordinates: {
          latitude:
            Number(
              (item.coordinates as Record<string, unknown>)?.latitude ??
                item.latitude ??
                item.lat ??
                0,
            ) || 0,
          longitude:
            Number(
              (item.coordinates as Record<string, unknown>)?.longitude ??
                item.longitude ??
                item.lng ??
                0,
            ) || 0,
        },
        timestamp,
      };
      console.log("[LocationAPI] Mapped contact:", mappedContact);
      return mappedContact;
    });
    return mapped;
  },
});

export { createLocationApiAdapter };
