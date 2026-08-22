import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Pill tag chips — used for category labels, status pills, discount
 * badges, etc. Mirrors the bookstore reference's rounded, dashed-border
 * category tags.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold font-display tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/20 text-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        accent: "border-transparent bg-accent/20 text-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        outline: "border-dashed border-border bg-transparent text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const Badge = ({ className, variant, ...props }) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };
