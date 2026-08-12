import axios from "axios";
import { store } from "@/store/store";
import { setCredentials, clearCredentials } from "@/store/slices/authSlice";

/**
 * Pre-configured Axios instance used for every API call in the app.
 * - `withCredentials: true` sends the httpOnly refresh-token cookie
 *   automatically.
 * - Centralizes the base URL so it is never hardcoded in feature code.
 *
 * NOTE on the `store` import: this creates a module cycle
 * (store -> authSlice -> authService -> authApi -> axiosInstance -> store).
 * That's safe here specifically because `store` is only ever read inside
 * the interceptor callbacks below, never at module load time — by the
 * time a request actually fires, every module has finished initializing
 * and the live binding to `store` resolves correctly. This is the
 * standard pattern for wiring Redux into an Axios instance.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attaches the current access token to every outgoing request.
axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Endpoints that must never trigger a silent-refresh retry — retrying
// these on 401 would either be meaningless (refresh-token itself) or
// risk a retry loop (login/register don't return 401 for auth reasons
// anyway, but are excluded defensively).
const REFRESH_EXEMPT_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
];

// Dedupes concurrent 401s (e.g. several requests firing at once right
// as the access token expires) into a single refresh-token call instead
// of one per request.
let refreshPromise = null;

/**
 * On a 401, silently attempts to reissue an access token from the
 * refresh-token cookie and retries the original request exactly once.
 * If the refresh itself fails, clears the session — PrivateRoute picks
 * this up on its next render (it's subscribed to the same Redux state)
 * and redirects to /login.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isExempt = REFRESH_EXEMPT_PATHS.some((path) =>
      originalRequest?.url?.includes(path),
    );

    if (error.response?.status !== 401 || isExempt || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        // Plain axios, not axiosInstance — going through axiosInstance
        // here would re-enter this same response interceptor.
        refreshPromise = axios
          .post(
            `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
            {},
            { withCredentials: true },
          )
          .finally(() => {
            refreshPromise = null;
          });
      }

      const { data } = await refreshPromise;
      const { user, accessToken } = data.data;

      store.dispatch(setCredentials({ user, accessToken }));

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      store.dispatch(clearCredentials());
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
