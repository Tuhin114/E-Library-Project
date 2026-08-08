import * as authApi from "@/api/authApi.js";
import { getErrorMessage } from "@/lib/errorHandler";

/**
 * Higher-level auth operations used directly by components/thunks.
 * Normalizes Axios errors into plain messages (via getErrorMessage) so
 * UI code never touches `error.response.data.message` directly, and
 * unwraps the backend's { success, message, data } envelope into just
 * the data payload. `authSlice.js` (Redux) calls into this layer
 * rather than `authApi` directly, so error/response handling stays in
 * one place.
 */
export const register = async (payload) => {
  try {
    const { data } = await authApi.registerUser(payload);
    return data.data; // { user }
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Registration failed. Please try again."),
    );
  }
};

export const login = async (payload) => {
  try {
    const { data } = await authApi.loginUser(payload);
    return data.data; // { user, accessToken }
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Login failed. Please check your credentials."),
    );
  }
};

/**
 * Attempts to reissue an access token from the refresh-token cookie.
 * Failing here (no cookie, expired token) is an expected, silent case —
 * it just means there's no existing session — so the caller (the
 * initializeSession thunk) treats a thrown error as "not logged in"
 * rather than something to display to the user.
 */
export const refreshAccessToken = async () => {
  const { data } = await authApi.refreshAccessToken();
  return data.data; // { user, accessToken }
};

export const getCurrentUser = async (accessToken) => {
  const { data } = await authApi.getCurrentUser(accessToken);
  return data.data; // { user }
};

/**
 * Calls the backend to clear the refresh-token cookie.
 * Deliberately swallows failures (e.g. network error, already-expired
 * token) — local session state gets cleared by the caller either way,
 * and a logout action should never leave the user stuck.
 */
export const logout = async () => {
  try {
    await authApi.logoutUser();
  } catch (error) {
    console.error(
      "Logout request failed:",
      getErrorMessage(error, error.message),
    );
  }
};

/**
 * Changes the current user's password. Unlike logout, failures here
 * (most commonly "current password is incorrect") must reach the form
 * as a real error rather than being swallowed.
 */
export const changePassword = async (payload) => {
  try {
    await authApi.changePassword(payload);
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not change password. Please try again."),
    );
  }
};

/**
 * Requests a password reset email. The backend responds with the same
 * generic message whether or not the account exists, so a thrown error
 * here means something actually went wrong (network, rate limit) —
 * never "no such account", which the API deliberately never reveals.
 */
export const forgotPassword = async (email) => {
  try {
    const { data } = await authApi.forgotPassword(email);
    return data.message;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Could not process your request. Please try again.",
      ),
    );
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    await authApi.resetPassword(token, newPassword);
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not reset password. Please try again."),
    );
  }
};
