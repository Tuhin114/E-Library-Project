import { Link } from "react-router-dom";
import { BookOpen, Star } from "lucide-react";
import { cn } from "../../lib/utils";
import FavoriteButton from "./FavoriteButton";

/**
 * Catalog book tile. `variant="grid"` (default) is the full catalog
 * grid card; `variant="compact"` is a smaller fixed-width tile for
 * horizontally-scrolling rows (RecommendedRow) — same implementation,
 * so the two contexts never drift out of sync with each other.
 */
const BookCard = ({ book, variant = "grid", subtitle }) => {
  const authorNames = (book.authors || [])
    .map((author) => author.name)
    .join(", ");
  const isCompact = variant === "compact";

  return (
    <Link
      to={`/books/${book._id}`}
      className={cn("block", isCompact && "w-36 shrink-0 snap-start sm:w-40")}
    >
      <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
        <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
          {book.coverImage?.url ? (
            <img
              src={book.coverImage.url}
              alt={book.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen
                className={cn(
                  "text-muted-foreground",
                  isCompact ? "h-6 w-6" : "h-9 w-9",
                )}
                strokeWidth={1.5}
              />
            </div>
          )}

          <div className="absolute right-1.5 top-1.5 rounded-full bg-background/80 backdrop-blur">
            <FavoriteButton bookId={book._id} variant="icon" />
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col gap-1", isCompact ? "p-2.5" : "p-3.5")}>
          {book.category?.name && !isCompact && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {book.category.name}
            </span>
          )}
          <h3
            className={cn(
              "line-clamp-2 font-display font-medium leading-snug text-foreground",
              isCompact ? "text-xs" : "text-sm",
            )}
          >
            {book.title}
          </h3>
          {authorNames && (
            <p
              className={cn(
                "line-clamp-1 text-muted-foreground",
                isCompact ? "text-[11px]" : "text-xs",
              )}
            >
              {authorNames}
            </p>
          )}
          {book.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span>{book.avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground/70">({book.reviewCount})</span>
            </div>
          )}
          {subtitle && (
            <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground/80">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
