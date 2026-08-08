import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Redirects to /login if there's no authenticated session in Redux.
 *
 * Safe to rely on across page refreshes: App.jsx dispatches
 * initializeSession on mount and holds off rendering routes until it
 * resolves, so by the time this component runs, Redux's auth state
 * reflects the real session (rehydrated from the refresh-token cookie),
 * not a stale post-reload default.
 */
export function PrivateRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
