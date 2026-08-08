import { useSyncExternalStore } from "react";
import { toastStore } from "@/lib/toastStore";

/**
 * Global toast notifications. Call `toast.success(...)` / `toast.error(...)`
 * from anywhere in the app — a form, a service, a thunk — with no
 * Provider needed. `Toaster.jsx` (mounted once in App.jsx) renders
 * whatever's currently in the shared store.
 */
export const toast = {
  success: (message, options) =>
    toastStore.add({ type: "success", message, ...options }),
  error: (message, options) =>
    toastStore.add({ type: "error", message, ...options }),
  info: (message, options) =>
    toastStore.add({ type: "info", message, ...options }),
  dismiss: (id) => toastStore.remove(id),
};

/**
 * Subscribes a component (just Toaster.jsx, in practice) to the live
 * list of active toasts.
 */
export function useToasts() {
  return useSyncExternalStore(toastStore.subscribe, toastStore.getToasts);
}
