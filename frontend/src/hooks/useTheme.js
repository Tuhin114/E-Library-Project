import { useSyncExternalStore } from "react";
import { themeStore } from "@/lib/themeStore";

/**
 * Subscribes to the app's light/dark theme. No Provider required —
 * `themeStore` is a single shared external store, same pattern as
 * `useToast`. Call `setTheme`/`toggleTheme` from anywhere (e.g. the
 * Navbar's ThemeToggle button).
 */
export function useTheme() {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.getTheme);

  return {
    theme,
    setTheme: themeStore.setTheme,
    toggleTheme: themeStore.toggleTheme,
  };
}
