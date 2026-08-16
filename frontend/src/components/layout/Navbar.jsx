import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut, Menu } from "lucide-react";

import { logoutUser } from "../../store/slices/authSlice";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";
import MobileDrawer from "../common/MobileDrawer";
import SidebarNav from "./SidebarNav";

/**
 * Top navigation bar. Brand, current user, theme toggle, logout — and,
 * below `md`, a hamburger that opens the same SidebarNav used on
 * desktop inside a MobileDrawer, so the app has real mobile navigation.
 */
const Navbar = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            to="/books"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            E-Library
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="hidden items-center gap-2 border-r border-border pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
          >
            <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
            <span className="font-medium text-foreground">{user?.name}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">
              {user?.role}
            </span>
          </Link>

          <ThemeToggle />

          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <MobileDrawer
        open={isNavOpen}
        onOpenChange={setIsNavOpen}
        title="Navigation"
        side="left"
      >
        <SidebarNav onNavigate={() => setIsNavOpen(false)} />
      </MobileDrawer>
    </header>
  );
};

export default Navbar;
