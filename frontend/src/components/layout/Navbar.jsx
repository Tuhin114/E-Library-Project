import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut, User } from "lucide-react";

import { logoutUser } from "../../store/slices/authSlice";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";

/**
 * Top navigation bar. Shows the app brand, current user, and logout.
 * Mobile nav / hamburger menu is added in Milestone 6 (responsive pass).
 */
const Navbar = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/categories" className="text-lg font-semibold tracking-tight">
          E-Library
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <User className="h-4 w-4" />
            <span>{user?.name}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">
              {user?.role}
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
