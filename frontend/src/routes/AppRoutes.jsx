import { Routes, Route, Navigate } from 'react-router-dom';
import Register from '@/pages/auth/Register';

/**
 * Temporary placeholder for the login route.
 * Register.jsx redirects here on success. The real Login page (form,
 * API call, session persistence) is built in M4 and will replace this
 * component entirely — nothing else references this placeholder.
 */
function LoginPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Login page coming in M4</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account was created successfully.</p>
      </div>
    </div>
  );
}

/**
 * Central route table.
 * PrivateRoute / RoleRoute guards are added in M5 once auth session
 * state (authSlice, useAuth) exists — for now every route is public.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            Page not found
          </div>
        }
      />
    </Routes>
  );
}
