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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-0 z-50 h-full w-72 max-w-[85vw] overflow-y-auto bg-background p-4 shadow-lg",
            side === "left" ? "left-0" : "right-0",
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
