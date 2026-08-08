import { ApiError } from "../utils/ApiError.js";

/**
 * Catches any request that didn't match a route.
 * Must be registered after all feature routes, before errorHandler —
 * turns "no route matched" into the same ApiError shape every other
 * error in the app produces, rather than a one-off response format.
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};
