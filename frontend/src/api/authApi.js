import axiosInstance from "./axiosInstance.js";

/**
 * Raw HTTP calls for the auth feature. Deliberately thin — no error
 * normalization, no state updates. `services/authService.js` is the
 * layer components actually call; this module only knows about endpoints.
 */

export const registerUser = (payload) =>
  axiosInstance.post("/auth/register", payload);

export const loginUser = (payload) =>
  axiosInstance.post("/auth/login", payload);

// Cookie is sent automatically (axiosInstance has withCredentials: true) —
// no body or token needed on the request itself.
export const refreshAccessToken = () =>
  axiosInstance.post("/auth/refresh-token");

// Called before the interceptor's token is even in the store yet
// (during initializeSession's bootstrap sequence), so the token is
// passed in explicitly rather than relying on the request interceptor.
export const getCurrentUser = (accessToken) =>
  axiosInstance.get("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

// Goes through axiosInstance normally — its request interceptor attaches
// the current access token automatically.
export const logoutUser = () => axiosInstance.post("/auth/logout");

export const changePassword = (payload) =>
  axiosInstance.patch("/auth/change-password", payload);

export const forgotPassword = (email) =>
  axiosInstance.post("/auth/forgot-password", { email });

export const resetPassword = (token, newPassword) =>
  axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
