import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Building2,
  BookOpen,
  Heart,
  History,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import { cn } from "../../lib/utils";

const navLinkClasses = ({ isActive }) =>
  cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-foreground",
  );

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
        <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">
          Browse
        </p>
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
      </nav>

      <nav className="mt-8 space-y-1">
        <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">
          My Library
        </p>
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
      </nav>

      {isLibrarian && (
        <nav className="mt-8 space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">
            Manage
          </p>
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
        </nav>
      )}
    </>
  );
};

export default SidebarNav;
