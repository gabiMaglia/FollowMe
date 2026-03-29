import * as Location from "expo-location";
import { useEffect, useState } from "react";

type LocationPermissionStatus = "undetermined" | "granted" | "denied";

export const useLocationPermission = () => {
  const [status, setStatus] =
    useState<LocationPermissionStatus>("undetermined");

  useEffect(() => {
    const request = async () => {
      const { status: foreground } =
        await Location.requestForegroundPermissionsAsync();

      setStatus(foreground === "granted" ? "granted" : "denied");
    };

    request();
  }, []);

  return { status };
};
