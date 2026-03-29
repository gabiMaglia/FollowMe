import { io, type Socket } from "socket.io-client";

import type { ContactLocation } from "@/src/domain/entities/location";
import type { RealtimeService } from "@/src/ports/outbound/realtime-service";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

const WS_URL = API_BASE_URL.replace("/api/v1", "");

const createSocketRealtimeService = (): RealtimeService => {
  let socket: Socket | null = null;

  const connect: RealtimeService["connect"] = (token) => {
    if (socket?.connected) return;

    socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1_000,
    });

    socket.on("connect", () => {
      console.log("[WS] Connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("[WS] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.warn("[WS] Connection error:", error.message);
    });
  };

  const disconnect: RealtimeService["disconnect"] = () => {
    socket?.disconnect();
    socket = null;
  };

  const onContactLocationUpdate: RealtimeService["onContactLocationUpdate"] = (
    callback,
  ) => {
    if (!socket) return () => {};

    const handler = (data: {
      userId: string;
      displayName: string;
      latitude: number;
      longitude: number;
      timestamp: number;
    }) => {
      const contact: ContactLocation = {
        userId: data.userId,
        displayName: data.displayName,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        timestamp: data.timestamp,
      };
      callback(contact);
    };

    socket.on("location:update", handler);

    return () => {
      socket?.off("location:update", handler);
    };
  };

  const isConnected: RealtimeService["isConnected"] = () => {
    return socket?.connected ?? false;
  };

  return {
    connect,
    disconnect,
    onContactLocationUpdate,
    isConnected,
  };
};

export { createSocketRealtimeService };
