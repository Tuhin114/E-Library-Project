import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";
import { notificationReceived } from "../store/slices/notificationsSlice";

const SOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

/**
 * Mounted once, near the app root (see App.jsx). Connects only while
 * authenticated — passes the access token via `auth`, not a header,
 * since Socket.io's handshake has no Authorization header equivalent
 * (see backend/src/config/socket.js). Reconnects automatically
 * whenever `accessToken` changes (login, silent refresh), and
 * disconnects cleanly on logout/unmount.
 *
 * Deliberately does not attempt to resubscribe/replay missed events
 * while disconnected — a reconnect just resumes live delivery from
 * that point on; anything missed while offline is still safely on the
 * server and shows up next time GET /me/notifications is fetched.
 */
export function useSocket() {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return undefined;

    console.log("[socket] Connecting to:", SOCKET_URL);

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("[socket] Connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("[socket] Connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] Disconnected:", reason);
    });

    socket.on("notification:new", (notification) => {
      console.log("[socket] Notification received:", notification);
      dispatch(notificationReceived(notification));
    });

    return () => {
      console.log("[socket] Cleaning up connection");
      socket.disconnect();
    };
  }, [dispatch, accessToken, isAuthenticated]);
}
