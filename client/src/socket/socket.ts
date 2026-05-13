import { io } from "socket.io-client";

// Prefer explicit socket URL if provided.
// Fallback to NEXT_PUBLIC_API_URL (remove /api) and finally localhost.
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
    : undefined) ||
  "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

