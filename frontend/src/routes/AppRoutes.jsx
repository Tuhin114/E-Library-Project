import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Register from "@/pages/auth/Register";
import Login from "@/pages/auth/Login";
import ChangePassword from "@/pages/auth/ChangePassword";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import MainLayout from "../components/layout/MainLayout";

import Categories from "../pages/categories/Categories";
import CategoryDetails from "../pages/categories/CategoryDetails";
import Authors from "../pages/authors/Authors";
import AuthorProfile from "../pages/authors/AuthorProfile";
import Publishers from "../pages/publishers/Publishers";
import PublisherDetails from "../pages/publishers/PublisherDetails";

import ManageCategories from "../pages/manage/ManageCategories";
import ManageAuthors from "../pages/manage/ManageAuthors";
import ManagePublishers from "../pages/manage/ManagePublishers";

import Books from "../pages/books/Books";
import BookDetails from "../pages/books/BookDetails";
import ManageBooks from "../pages/manage/ManageBooks";
import CreateBook from "../pages/manage/CreateBook";
import EditBook from "../pages/manage/EditBook";

import Favorites from "../pages/favorites/Favorites";
import RecentlyViewed from "../pages/library/RecentlyViewed";

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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPlaceholder />} />

          {/* Browse */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<CategoryDetails />} />

          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/:slug" element={<AuthorProfile />} />

          <Route path="/publishers" element={<Publishers />} />
          <Route path="/publishers/:slug" element={<PublisherDetails />} />

          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />

          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recently-viewed" element={<RecentlyViewed />} />

          {/* Change password */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Librarian only */}
          <Route element={<RoleRoute allowedRoles={[ROLES.LIBRARIAN]} />}>
            <Route path="/manage/categories" element={<ManageCategories />} />
            <Route path="/manage/authors" element={<ManageAuthors />} />
            <Route path="/manage/publishers" element={<ManagePublishers />} />
            <Route path="/manage/books" element={<ManageBooks />} />
            <Route path="/manage/books/new" element={<CreateBook />} />
            <Route path="/manage/books/:id/edit" element={<EditBook />} />
          </Route>
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
