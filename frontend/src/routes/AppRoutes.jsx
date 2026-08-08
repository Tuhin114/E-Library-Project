import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Register from "@/pages/auth/Register";
import Login from "@/pages/auth/Login";
import ChangePassword from "@/pages/auth/ChangePassword";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import { PrivateRoute } from "./PrivateRoute";
import { RoleRoute } from "./RoleRoute";
import { ROLES } from "@/constants/roles";
import { logoutUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

/**
 * Temporary placeholder for the post-login landing page.
 * The real dashboard belongs to a later phase, outside the auth
 * milestones — this exists to give Login.jsx somewhere valid to
 * redirect to, something for PrivateRoute to guard, and (now that
 * logout exists) a way to exercise the full login/logout loop.
 */
function DashboardPlaceholder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-foreground">
          Welcome{user?.name ? `, ${user.name}` : ""} 🎉
        </h1>
        <p className="text-sm text-muted-foreground">
          The real dashboard is built in a later phase — this route is a
          placeholder.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/change-password">
            <Button variant="secondary">Change password</Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder demonstrating RoleRoute end-to-end. Real librarian
 * tooling (catalog management, etc.) belongs to a later phase — this
 * route exists purely to prove the RBAC guard works.
 */
function LibrarianAreaPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Librarian area
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Visible only to the librarian role — real tooling comes in a later
          phase.
        </p>
      </div>
    </div>
  );
}

/**
 * Central route table. Auth state driving PrivateRoute/RoleRoute is
 * rehydrated on app load (see App.jsx -> initializeSession) and kept
 * fresh mid-session by the axios response interceptor's silent-refresh
 * flow (see api/axiosInstance.js) — so these guards are reliable across
 * both page reloads and long-lived sessions where the access token expires.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route element={<RoleRoute allowedRoles={[ROLES.LIBRARIAN]} />}>
          <Route path="/librarian" element={<LibrarianAreaPlaceholder />} />
        </Route>
      </Route>

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
