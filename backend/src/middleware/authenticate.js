import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

/**
 * Verifies the access token sent as `Authorization: Bearer <token>`,
 * loads the corresponding user, and attaches it to req.user for
 * downstream handlers/middleware (e.g. authorize()).
 *
 * Re-fetches the user on every request rather than trusting the JWT
 * payload alone, so a deactivated or deleted account is rejected
 * immediately instead of waiting for the token to expire.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.accessSecret);
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired, please log in again"
        : "Invalid authentication token";
    throw new ApiError(401, message);
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Account no longer exists or is inactive");
  }

  req.user = user;
  next();
});
