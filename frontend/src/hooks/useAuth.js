import { useSelector } from "react-redux";

/**
 * Exposes the current auth session state.
 * Components should read auth state through this hook rather than
 * calling `useSelector((state) => state.auth...)` directly, so the
 * underlying slice shape can evolve without touching every consumer.
 */
export function useAuth() {
  const { user, accessToken, isAuthenticated, isInitializing, status, error } =
    useSelector((state) => state.auth);

  return { user, accessToken, isAuthenticated, isInitializing, status, error };
}
