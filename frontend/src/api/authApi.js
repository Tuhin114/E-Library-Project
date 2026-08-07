import axiosInstance from './axiosInstance.js';

/**
 * Raw HTTP calls for the auth feature. Deliberately thin — no error
 * normalization, no state updates. `services/authService.js` is the
 * layer components actually call; this module only knows about endpoints.
 */

export const registerUser = (payload) => axiosInstance.post('/auth/register', payload);

// login, logout, refresh, me, etc. are added here as each milestone lands.
