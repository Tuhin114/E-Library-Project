import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "@/routes/AppRoutes";
import { initializeSession } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/common/Toaster";

/**
 * Root application component.
 * Dispatches the session-bootstrap thunk once on mount, and holds off
 * rendering any routes until it resolves — this is what makes
 * PrivateRoute's redirect decision reliable instead of racing ahead
 * of the actual auth check on every page load.
 *
 * Toaster is mounted once here, outside the loading gate, so it's
 * available immediately and persists across route changes — a toast
 * fired right before a navigate() call (e.g. "Logged out") survives
 * the transition instead of unmounting with the page that triggered it.
 */
function App() {
  const dispatch = useDispatch();
  const { isInitializing } = useAuth();

  useEffect(() => {
    dispatch(initializeSession());
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
