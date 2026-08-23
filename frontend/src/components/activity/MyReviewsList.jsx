import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Star } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/**
 * No "my reviews" list exists anywhere else in the app — reviews are
 * only ever shown per-book (ReviewList/ReviewItem on BookDetails).
 * This is a smaller, read-only variant scoped to the dashboard: no
 * edit/delete here, that stays on the book page where the full
 * ReviewItem (with those actions) already lives.
 */
const MyReviewsList = ({ reviews, isLoading, count, emptyText }) => {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            My Reviews
          </h2>
          {typeof count === "number" && count > 0 && (
            <Badge variant="secondary">{count}</Badge>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="divide-y divide-border rounded-2xl border border-border">
          {reviews.map((review) => (
            <Link
              key={review._id}
              to={`/books/${review.book._id}`}
              className="flex items-start gap-3 p-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-accent/15"
            >
              <div className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                {review.book.coverImage?.url ? (
                  <img
                    src={review.book.coverImage.url}
                    alt={review.book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {review.book.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <StarRating value={review.rating} size="sm" className="mt-1" />
                {review.comment && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>

              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
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

export default MyReviewsList;
