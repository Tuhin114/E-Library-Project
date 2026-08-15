import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../../hooks/useTheme";

/**
 * Light/dark theme switch. Self-contained — reads/writes theme via
 * `useTheme`, no props required, safe to drop into any toolbar.
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeToggle;
