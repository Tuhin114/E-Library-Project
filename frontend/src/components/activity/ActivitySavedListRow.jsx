import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Same row shell as ActivityBookRow/ActivityResourceRow, but the card
 * markup is self-contained here rather than reusing a shared
 * "SavedListCard" component — SavedLists.jsx (Phase 10 M3) has its own
 * inline card with a delete-button overlay this row doesn't need, and
 * extracting a shared component for one extra usage wasn't worth
 * touching that already-shipped file's markup for.
 */
const ActivitySavedListRow = ({
  title,
  icon: Icon,
  lists,
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
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-56 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : lists && lists.length > 0 ? (
        <div className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {lists.map((list) => (
            <Link
              key={list._id}
              to={`/saved-lists/${list._id}`}
              className="block w-56 shrink-0 snap-start"
            >
              <div className="flex h-24 flex-col gap-1 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-elevated">
                <h3 className="truncate font-display text-sm font-medium text-foreground">
                  {list.title}
                </h3>
                {list.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {list.description}
                  </p>
                )}
                <p className="mt-auto text-xs text-muted-foreground">
                  {list.itemCount} item{list.itemCount === 1 ? "" : "s"}
                </p>
              </div>
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

export default ActivitySavedListRow;
