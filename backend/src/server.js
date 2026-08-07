import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './database/connection.js';

/**
 * Application entry point.
 * Connects to the database first, then starts the HTTP server — this
 * ensures the app never accepts traffic without a working DB connection.
 */
const startServer = async () => {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`[server] Running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`[server] Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
