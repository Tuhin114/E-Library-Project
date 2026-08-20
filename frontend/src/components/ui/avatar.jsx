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

const Avatar = forwardRef(({ src, name, size = "md", className }, ref) => {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;

  return (
    <div
      ref={ref}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-semibold",
        showImage ? "bg-white" : "bg-accent text-accent-foreground",
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
