import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToasts, toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

const VARIANT_STYLES = {
  success: "border-primary/40 bg-primary/10",
  error: "border-destructive/40 bg-destructive/10",
  info: "border-border bg-secondary/50",
};

/**
 * Renders every currently active toast, bottom-right, stacked newest
 * on top. Mount once — nothing else needs to render this component;
 * trigger toasts from anywhere via `toast.success(...)` etc.
 */
export function Toaster() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm text-foreground shadow-lg backdrop-blur",
                VARIANT_STYLES[t.type] || VARIANT_STYLES.info,
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1">{t.message}</p>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
