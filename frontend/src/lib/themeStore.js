const STORAGE_KEY = "e-library-theme";

let listeners = [];

/**
 * Reads the theme the blocking bootstrap script in index.html already
 * applied to <html> before React mounted, so this store's initial
 * value always matches what's on screen (no mismatch, no flash).
 */
function getInitialTheme() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

let theme = getInitialTheme();

function applyTheme(next) {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private browsing / storage disabled — theme still applies for
    // this session, it just won't persist across reloads.
  }
}

export const themeStore = {
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getTheme() {
    return theme;
  },
  setTheme(next) {
    theme = next;
    applyTheme(next);
    listeners.forEach((listener) => listener());
  },
  toggleTheme() {
    themeStore.setTheme(theme === "dark" ? "light" : "dark");
  },
};
