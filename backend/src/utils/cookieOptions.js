import { env } from "../config/env.js";

/**
 * Options for the httpOnly refresh-token cookie.
 * Centralized here so login (M4), refresh, and logout (M7) all set/clear
 * the exact same cookie — a mismatch in any option (path, sameSite) would
 * silently break refresh/logout.
 */
export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  path: "/api/auth", // only sent to auth endpoints, never to the whole API
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — keep in sync with JWT_REFRESH_EXPIRY
};
