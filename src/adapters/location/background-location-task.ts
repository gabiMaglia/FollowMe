import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

const LOCATION_TASK_NAME = "LOCATION_TRACKING";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

/**
 * Background task defined at module level (outside any component).
 * Uses fetch (not WebSockets) because the OS can kill WS connections in background.
 * The task sends coordinates to the backend via REST API.
 * Wrapped in try/catch because TaskManager.defineTask may crash in Expo Go.
 */
try {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error("[BG Location] Task error:", error.message);
      return;
    }

    if (!data) return;

    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (!location) return;

    try {
      const accessToken = await SecureStore.getItemAsync(
        "followme_access_token",
      );
      if (!accessToken) {
        console.warn("[BG Location] No access token, skipping update");
        return;
      }

      await fetch(`${API_BASE_URL}/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
        }),
      });
    } catch (fetchError) {
      console.error("[BG Location] Failed to send update:", fetchError);
    }
  });
} catch {
  console.warn("[BG Location] TaskManager.defineTask not available (Expo Go?)");
}

export { LOCATION_TASK_NAME };
