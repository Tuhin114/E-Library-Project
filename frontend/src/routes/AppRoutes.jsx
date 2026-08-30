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
import BookReader from "../pages/reader/BookReader";

import Favorites from "../pages/favorites/Favorites";
import RecentlyViewed from "../pages/library/RecentlyViewed";
import ContinueReading from "../pages/library/ContinueReading";
import Activity from "../pages/activity/Activity";
import Profile from "../pages/profile/Profile";
import Forum from "../pages/forum/Forum";
import ForumThreadDetail from "../pages/forum/ForumThreadDetail";
import ForumReports from "../pages/forum/ForumReports";
import CatalogAnalytics from "../pages/analytics/CatalogAnalytics";
import EngagementAnalytics from "../pages/analytics/EngagementAnalytics";
import ModerationAnalytics from "../pages/analytics/ModerationAnalytics";
import Circulation from "../pages/analytics/Circulation";
import Financial from "../pages/analytics/Financial";
import AnalyticsDashboard from "../pages/analytics/AnalyticsDashboard";
import MyRequests from "../pages/requests/MyRequests";
import ManageRequests from "../pages/manage/ManageRequests";
import MyLoans from "../pages/loans/MyLoans";
import ManageLoans from "../pages/manage/ManageLoans";
import MyFees from "../pages/fees/MyFees";
import ManageFees from "../pages/manage/ManageFees";
import LibrarySettings from "../pages/manage/LibrarySettings";

import { PrivateRoute } from "./PrivateRoute";
import { RoleRoute } from "./RoleRoute";
import { ROLES } from "@/constants/roles";
import { logoutUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

/**
 * Temporary placeholder for the post-login landing page.
 * The real dashboard belongs to a later phase, outside the auth
 * milestones — this exists to give Login.jsx somewhere valid to
 * redirect to, something for PrivateRoute to guard, and (now that
 * logout exists) a way to exercise the full login/logout loop.
 *
 * Renders inside MainLayout (Navbar/Sidebar already wrap it), so it
 * uses the same PageContainer/PageHeader shell as every other page
 * instead of a competing full-screen centered layout.
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
    <PageContainer>
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
        description="The full dashboard is coming in a later phase — for now, here's quick access to your account and the catalog."
      />
      <div className="flex flex-wrap gap-3">
        <Link to="/books">
          <Button>Browse books</Button>
        </Link>
        <Link to="/change-password">
          <Button variant="secondary">Change password</Button>
        </Link>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </PageContainer>
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
        {/* Full-screen reader — deliberately outside MainLayout so the
            nav/sidebar chrome doesn't compete with the reading surface. */}
        <Route path="/books/:id/read" element={<BookReader />} />

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
          <Route path="/continue-reading" element={<ContinueReading />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/loans" element={<MyLoans />} />
          <Route path="/fees" element={<MyFees />} />

          {/* Change password */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Forum */}
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:id" element={<ForumThreadDetail />} />

          {/* Librarian only */}
          <Route element={<RoleRoute allowedRoles={[ROLES.LIBRARIAN]} />}>
            <Route path="/manage/categories" element={<ManageCategories />} />
            <Route path="/manage/authors" element={<ManageAuthors />} />
            <Route path="/manage/publishers" element={<ManagePublishers />} />
            <Route path="/manage/books" element={<ManageBooks />} />
            <Route path="/manage/books/new" element={<CreateBook />} />
            <Route path="/manage/books/:id/edit" element={<EditBook />} />
            <Route path="/forum/reports" element={<ForumReports />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/analytics/catalog" element={<CatalogAnalytics />} />
            <Route path="/analytics/engagement" element={<EngagementAnalytics />} />
            <Route path="/analytics/moderation" element={<ModerationAnalytics />} />
            <Route path="/analytics/circulation" element={<Circulation />} />
            <Route path="/analytics/financial" element={<Financial />} />
            <Route path="/manage/requests" element={<ManageRequests />} />
            <Route path="/manage/loans" element={<ManageLoans />} />
            <Route path="/manage/fees" element={<ManageFees />} />
            <Route path="/manage/settings" element={<LibrarySettings />} />
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
