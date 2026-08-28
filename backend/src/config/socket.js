import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "./env.js";
import { corsOptions } from "./corsOptions.js";

let io = null;

/**
 * Verifies the same access token the REST API uses (sent via
 * `socket.handshake.auth.token`, not a header — Socket.io's handshake
 * has no Authorization header equivalent) and rejects the connection
 * outright on failure. Re-checks `isActive` for the same reason
 * `authenticate` middleware does: a deactivated account shouldn't keep
 * a live push channel just because its token hasn't expired yet.
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const payload = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      return next(new Error("Account no longer exists or is inactive"));
    }

    socket.userId = user._id.toString();
    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
};

/**
 * Initializes Socket.io on top of the existing HTTP server and wires
 * every authenticated connection into a per-user room
 * (`user:${userId}`) — this is what lets notificationService push to
 * "whichever sockets this user currently has open" without tracking
 * socket ids anywhere itself. Call once, at boot, from server.js.
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const room = `user:${socket.userId}`;

    socket.join(room);

    console.log(
      `[socket] Connected: socket=${socket.id}, user=${socket.userId}, room=${room}`,
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `[socket] Disconnected: socket=${socket.id}, user=${socket.userId}, reason=${reason}`,
      );
    });
  });

  return io;
};

/**
 * Emits a real-time event to every socket a user currently has open.
 * A no-op (not a throw) if the user is offline or Socket.io hasn't
 * been initialized (e.g. running a script outside the HTTP server) —
 * real-time push is a nice-to-have on top of the persisted
 * Notification document, never a requirement for the write to succeed.
 */
export const emitToUser = (userId, event, payload) => {
  if (!io) {
    console.log("[socket] ERROR: io is not initialized");
    return;
  }

  const room = `user:${userId.toString()}`;
  const roomSockets = io.sockets.adapter.rooms.get(room);

  console.log("[socket] EMIT DEBUG", {
    room,
    event,
    connectedSockets: roomSockets?.size ?? 0,
    socketIds: roomSockets ? [...roomSockets] : [],
  });

  io.to(room).emit(event, payload);
};

export const getIO = () => io;
