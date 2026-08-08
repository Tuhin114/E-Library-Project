import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Short-lived token sent to the client and attached to the
 * Authorization header on subsequent requests. Carries just enough
 * to authorize a request (subject + role) — never sensitive data.
 */
export const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiry,
    },
  );

/**
 * Long-lived token stored only in an httpOnly cookie (never exposed to
 * JS). Used to silently obtain a new access token once it expires —
 * consumed by the refresh endpoint added in M7.
 */
export const generateRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  });
