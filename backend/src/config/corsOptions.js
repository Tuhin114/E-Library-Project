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
  // Browsers only expose a small header whitelist to cross-origin JS by
  // default (Content-Disposition isn't in it). Added in Phase 5 M5 so
  // the frontend's CSV export can read the server-generated filename
  // out of the response instead of falling back to a generic one —
  // without this, exports still work, but always download as
  // "export.csv" instead of the real filename in any deployment where
  // frontend and backend are different origins (this app's actual
  // render.yaml/vercel.json split, not just a local dev quirk).
  exposedHeaders: ['Content-Disposition'],
};
