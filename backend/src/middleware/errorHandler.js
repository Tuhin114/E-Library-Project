import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Normalizes any thrown/passed error into a consistent JSON response.
 * Passes the app's own ApiError through as-is, translates common
 * Mongoose/JWT error types into sensible HTTP statuses, and falls back
 * to a generic 500 for anything unexpected — so a raw driver stack
 * trace or Mongoose error shape never reaches the client.
 *
 * Must be registered last in app.js, after all routes and other
 * middleware, per Express's error-handling middleware convention
 * (four-argument signature).
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === "CastError") {
    // Mongoose: malformed value for a typed field (e.g. an invalid
    // ObjectId in a route param like /users/not-an-id).
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  } else if (err.name === "ValidationError" && err.errors) {
    // Mongoose: schema validation failed at the database layer.
    // Defensive — Zod validation (validateRequest) should already
    // catch this earlier in the request for known routes.
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(422, "Validation failed", details);
  } else if (err.code === 11000) {
    // Mongoose: unique index violation (e.g. duplicate email on a
    // race condition between two concurrent registrations).
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `An account with this ${field} already exists`);
  } else if (err.name === "JsonWebTokenError") {
    // Defensive fallback — authenticate.js and authService already
    // handle their own JWT verification explicitly; this only fires
    // for a stray jwt.verify() call elsewhere that didn't catch it.
    error = new ApiError(401, "Invalid authentication token");
  } else if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Session expired, please log in again");
  } else if (!(error instanceof ApiError)) {
    // Anything unrecognized stays generic rather than leaking internals
    // (e.g. raw driver error messages) to the client in production.
    error = new ApiError(
      500,
      env.isDevelopment ? err.message : "Internal server error",
    );
  }

  if (env.isDevelopment) {
    console.error(err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(env.isDevelopment && { stack: err.stack }),
  });
};
