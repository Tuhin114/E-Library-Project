import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  Heart,
  History,
  BookMarked,
  User,
  MessageSquare,
  Flag,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import { cn } from "../../lib/utils";

const navLinkClasses = ({ isActive }) =>
  cn(
    "flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold font-display transition-colors",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-accent/15 hover:text-foreground",
  );

const sectionLabelClasses =
  "px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70";

/**
 * `onNavigate` is called after any link click — the desktop Sidebar can
 * ignore it (nothing to close), while the mobile drawer passes in a
 * callback that closes itself so tapping a link doesn't leave the drawer
 * open over the newly-navigated page.
 */
const SidebarNav = ({ onNavigate }) => {
  const { user } = useAuth();
  const isLibrarian = user?.role === ROLES.LIBRARIAN;

  const handleClick = () => onNavigate?.();

  return (
    <>
      <nav className="space-y-1">
        <p className={sectionLabelClasses}>Browse</p>
        <NavLink
          to="/categories"
          className={navLinkClasses}
          onClick={handleClick}
        >
          <LayoutGrid className="h-4 w-4" />
          Categories
        </NavLink>
        <NavLink to="/authors" className={navLinkClasses} onClick={handleClick}>
          <Users className="h-4 w-4" />
          Authors
        </NavLink>
        <NavLink
          to="/publishers"
          className={navLinkClasses}
          onClick={handleClick}
        >
          <Building2 className="h-4 w-4" />
          Publishers
        </NavLink>
        <NavLink to="/books" className={navLinkClasses} onClick={handleClick}>
          <BookOpen className="h-4 w-4" />
          Books
        </NavLink>
        <NavLink to="/forum" className={navLinkClasses} onClick={handleClick}>
          <MessageSquare className="h-4 w-4" />
          Forum
        </NavLink>
      </nav>

      <nav className="mt-8 space-y-1">
        <p className={sectionLabelClasses}>My Library</p>
        <NavLink
          to="/favorites"
          className={navLinkClasses}
          onClick={handleClick}
        >
          <Heart className="h-4 w-4" />
          Favorites
        </NavLink>
        <NavLink
          to="/recently-viewed"
          className={navLinkClasses}
          onClick={handleClick}
        >
          <History className="h-4 w-4" />
          Recently Viewed
        </NavLink>
        <NavLink
          to="/continue-reading"
          className={navLinkClasses}
          onClick={handleClick}
        >
          <BookMarked className="h-4 w-4" />
          Continue Reading
        </NavLink>
      </nav>

      <nav className="mt-8 space-y-1">
        <p className={sectionLabelClasses}>Account</p>
        <NavLink to="/activity" className={navLinkClasses} onClick={handleClick}>
          <LayoutDashboard className="h-4 w-4" />
          Activity
        </NavLink>
        <NavLink to="/profile" className={navLinkClasses} onClick={handleClick}>
          <User className="h-4 w-4" />
          Profile
        </NavLink>
      </nav>

      {isLibrarian && (
        <nav className="mt-8 space-y-1">
          <p className={sectionLabelClasses}>Manage</p>
          <NavLink
            to="/manage/categories"
            className={navLinkClasses}
            onClick={handleClick}
          >
            <LayoutGrid className="h-4 w-4" />
            Manage Categories
          </NavLink>
          <NavLink
            to="/manage/authors"
            className={navLinkClasses}
            onClick={handleClick}
          >
            <Users className="h-4 w-4" />
            Manage Authors
          </NavLink>
          <NavLink
            to="/manage/publishers"
            className={navLinkClasses}
            onClick={handleClick}
          >
            <Building2 className="h-4 w-4" />
            Manage Publishers
          </NavLink>
          <NavLink
            to="/manage/books"
            className={navLinkClasses}
            onClick={handleClick}
          >
            <BookOpen className="h-4 w-4" />
            Manage Books
          </NavLink>
          <NavLink
            to="/forum/reports"
            className={navLinkClasses}
            onClick={handleClick}
          >
            <Flag className="h-4 w-4" />
            Forum Reports
          </NavLink>
          <NavLink
            to="/analytics"
            className={navLinkClasses}
            onClick={handleClick}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </NavLink>
        </nav>
      )}
    </>
  );
};

export default SidebarNav;
