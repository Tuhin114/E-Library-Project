import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const MobileDrawer = ({
  open,
  onOpenChange,
  title,
  children,
  side = "left",
}) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-0 z-50 h-full w-72 max-w-[85vw] overflow-y-auto border-border bg-background p-4 shadow-elevated",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            side === "left"
              ? "left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
              : "right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {title || "Menu"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <div className="mt-8">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default MobileDrawer;
