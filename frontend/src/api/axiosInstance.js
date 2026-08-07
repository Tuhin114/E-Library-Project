import axios from 'axios';

/**
 * Pre-configured Axios instance used for every API call in the app.
 * - `withCredentials: true` sends the httpOnly refresh-token cookie
 *   automatically once auth is implemented (M4/M7).
 * - Centralizes the base URL so it is never hardcoded in feature code.
 *
 * Auth-specific interceptors (attach access token, silent refresh on 401,
 * logout on refresh failure) are added in M7.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
