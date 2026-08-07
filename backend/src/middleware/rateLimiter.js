import rateLimit from 'express-rate-limit';

/**
 * Factory for route-specific rate limiters.
 * The global limiter in app.js protects the whole API; individual
 * sensitive auth endpoints (register, login, forgot-password, ...) use
 * a stricter limiter created from here to slow down brute-force and
 * spam-account attempts without duplicating rate-limit config everywhere.
 */
export const createRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });
