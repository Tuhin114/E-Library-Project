let toasts = [];
let listeners = [];

const emitChange = () => {
  listeners.forEach((listener) => listener(toasts));
};

/**
 * Plain module-level store (not React Context) so `toast.success(...)`
 * can be called from anywhere — services, Redux thunks, route
 * components — without needing to be inside a Provider. `Toaster.jsx`
 * subscribes to this same store to render whatever's currently in it.
 */
export const toastStore = {
  getToasts: () => toasts,
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  add: ({ duration = 4000, ...toast }) => {
    const id = crypto.randomUUID();
    toasts = [...toasts, { id, ...toast }];
    emitChange();
    if (duration > 0) {
      setTimeout(() => toastStore.remove(id), duration);
    }
    return id;
  },
  remove: (id) => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  },
};
