import { env } from './env.js';

/**
 * CORS configuration.
 * Restricts cross-origin requests to the configured client URL and allows
 * credentials (cookies) to be sent — required for the httpOnly refresh
 * token cookie introduced in M4/M7.
 */
export const corsOptions = {
  origin: env.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
