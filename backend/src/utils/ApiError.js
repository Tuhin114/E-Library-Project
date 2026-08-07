/**
 * Standardized application error.
 * Thrown from services/controllers so the global error handler can
 * respond with a consistent shape and the correct HTTP status code,
 * instead of every layer inventing its own error format.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // expected/handled error, not a bug
    Error.captureStackTrace(this, this.constructor);
  }
}
