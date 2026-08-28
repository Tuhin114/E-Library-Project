import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './database/connection.js';
import { initSocket } from './config/socket.js';
import { startJobs } from './jobs/index.js';

/**
 * Application entry point.
 * Connects to the database first, then starts the HTTP server — this
 * ensures the app never accepts traffic without a working DB connection.
 *
 * M1 (Phase 7): the Express app is now wrapped in a plain `http.Server`
 * rather than listening directly, because Socket.io needs to attach to
 * the raw HTTP server (it upgrades the same port to WebSocket, it
 * doesn't run on a separate one). Jobs are started after both the DB
 * and the socket server are ready, since the loan-due-reminder sweep
 * writes Notifications and pushes over sockets.
 */
const startServer = async () => {
  await connectDatabase();

  const httpServer = http.createServer(app);
  initSocket(httpServer);
  startJobs();

  const server = httpServer.listen(env.port, () => {
    console.log(`[server] Running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`[server] Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
