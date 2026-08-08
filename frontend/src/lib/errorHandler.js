/**
 * Extracts a user-facing message from a caught error.
 * Centralizes the `error.response?.data?.message || fallback` pattern
 * that was previously duplicated in every function of
 * services/authService.js — one place to change if the backend's
 * error response shape ever changes.
 */
export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  return error?.response?.data?.message || fallback;
}
