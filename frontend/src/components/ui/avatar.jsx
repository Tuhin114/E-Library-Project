import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-xl",
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/**
 * Circular avatar. Renders the image when a URL is given and loads
 * successfully; falls back to initials-on-accent otherwise (missing
 * avatar, broken URL, still loading).
 */
const Avatar = forwardRef(({ src, name, size = "md", className }, ref) => {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;

  return (
    <div
      ref={ref}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-display font-semibold text-accent-foreground",
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{getInitials(name) || "?"}</span>
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
