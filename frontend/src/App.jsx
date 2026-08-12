import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "@/routes/AppRoutes";
import { initializeSession } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/common/Toaster";

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
