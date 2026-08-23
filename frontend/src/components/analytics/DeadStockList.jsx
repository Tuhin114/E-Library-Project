import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short" });

const DeadStockList = ({ books, isLoading, emptyText }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-2xl" />
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
    <ul className="divide-y divide-border rounded-2xl border border-border">
      {books.map((book) => (
        <li key={book._id}>
          <Link
            to={`/books/${book._id}`}
            className="flex items-center gap-3 p-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-accent/15"
          >
            <div className="flex h-10 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
              {book.coverImage?.url ? (
                <img
                  src={book.coverImage.url}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{book.title}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              Published {formatDate(book.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default DeadStockList;
