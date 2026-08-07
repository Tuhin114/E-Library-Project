import * as authApi from '@/api/authApi.js';

/**
 * Higher-level auth operations used directly by components/hooks.
 * Normalizes Axios errors into plain messages so UI code never touches
 * `error.response.data.message` directly, and unwraps the backend's
 * { success, message, data } envelope into just the data payload.
 *
 * This is also where Redux dispatches will be added once authSlice
 * exists (M4) — components won't need to change when that happens.
 */
export const register = async (payload) => {
  try {
    const { data } = await authApi.registerUser(payload);
    return data.data; // { user }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
  }
};
