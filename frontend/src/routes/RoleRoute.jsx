import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Restricts nested routes to specific roles — the frontend mirror of
 * the backend's authorize() middleware. Must be nested inside a
 * PrivateRoute (or placed after one in the tree); it assumes the user
 * is already authenticated and only adds the role check.
 *
 * Usage:
 *   <Route element={<PrivateRoute />}>
 *     <Route element={<RoleRoute allowedRoles={[ROLES.LIBRARIAN]} />}>
 *       <Route path="/librarian" element={<LibrarianArea />} />
 *     </Route>
 *   </Route>
 */
export function RoleRoute({ allowedRoles }) {
  const user = useSelector((state) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
