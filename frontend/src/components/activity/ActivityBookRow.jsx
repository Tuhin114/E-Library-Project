import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import BookCard from "@/components/catalog/BookCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Same horizontal-scroll row shell RecommendedRow uses on the Books
 * page — reused here for the three book-backed sections of the
 * dashboard (Favorites, Continue Reading, Recently Completed) so all
 * four "row of books" surfaces in the app share one visual pattern.
 *
 * `viewAllHref` links out to the existing dedicated page for that
 * section instead of this component trying to paginate — the backend
 * only ever sends the latest 5.
 */
const ActivityBookRow = ({
  title,
  icon: Icon,
  books,
  isLoading,
  count,
  viewAllHref,
  emptyText,
}) => {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {typeof count === "number" && count > 0 && (
            <Badge variant="secondary">{count}</Badge>
          )}
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="aspect-[2/3] w-36 shrink-0 rounded-2xl sm:w-40"
            />
          ))}
        </div>
      ) : books && books.length > 0 ? (
        <div className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {books.map((book) => (
            <BookCard key={book._id} book={book} variant="compact" />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      )}
    </section>
  );
};

export default ActivityBookRow;
