import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

/**
 * Read-only by default (pass `value`). Pass `onChange` to make it a
 * clickable input — used by ReviewForm to pick a 1–5 rating.
 */
const StarRating = ({ value = 0, onChange, size = "md", className }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const isInteractive = typeof onChange === "function";
  const displayValue = isInteractive && hoverValue ? hoverValue : value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={() => isInteractive && setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            SIZES[size],
            star <= displayValue
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground/40",
            isInteractive && "cursor-pointer transition-colors",
          )}
          onMouseEnter={() => isInteractive && setHoverValue(star)}
          onClick={() => isInteractive && onChange(star)}
        />
      ))}
    </div>
  );
};

export { StarRating };
