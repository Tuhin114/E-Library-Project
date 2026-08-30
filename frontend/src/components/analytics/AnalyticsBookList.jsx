import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Deliberately not BookCard/ActivityBookRow's horizontal-scroll grid —
 * rank order is the whole point of this data ("#1 most favorited"), and
 * a numbered vertical list reads that ordering much more clearly than a
 * row of same-size tiles would. BookCard's `subtitle` prop exists for
 * exactly this ("12 favorites" under the title) but a full cover-grid
 * card is more real estate than a top-10 ranked list needs.
 */
const AnalyticsBookList = ({ books, isLoading, emptyText, metricPrefix, metricSuffix }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-2xl border border-border">
      {books.map((book, index) => (
        <li key={book._id}>
          <Link
            to={`/books/${book._id}`}
            className="flex items-center gap-3 p-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-accent/15"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-center font-display text-xs font-bold text-secondary-foreground">
              {index + 1}
            </span>

            <div className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
              {book.coverImage?.url ? (
                <img
                  src={book.coverImage.url}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <BookOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{book.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {(book.authors || []).map((author) => author.name).join(", ")}
              </p>
            </div>

            <span className="shrink-0 whitespace-nowrap font-display text-sm font-bold text-foreground">
              {metricPrefix}
              {typeof book.metricValue === "number" && !Number.isInteger(book.metricValue)
                ? book.metricValue.toFixed(1)
                : book.metricValue}
              {metricSuffix && (
                <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">
                  {metricSuffix}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
};

export default AnalyticsBookList;
