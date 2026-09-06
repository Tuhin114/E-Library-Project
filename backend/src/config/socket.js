import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Emitter } from "@socket.io/redis-emitter";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "./env.js";
import { corsOptions } from "./corsOptions.js";
import { redisConnection } from "./redisConnection.js";

let io = null;
const emitter = new Emitter(redisConnection);

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

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: true,
    },
  });

  const pubClient = redisConnection.duplicate();
  const subClient = redisConnection.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

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

export const emitToUser = (userId, event, payload) => {
  const room = `user:${userId.toString()}`;
  console.log("[socket] EMIT (via redis)", { room, event });
  emitter.to(room).emit(event, payload);
};

export const getIO = () => io;
