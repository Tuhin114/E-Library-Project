import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ResourceCard from "@/components/resources/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Same horizontal-scroll row shell ActivityBookRow uses for the
 * book-backed sections — reused here for "My Uploads" so the pattern
 * stays one implementation across every "row of cards" section on the
 * dashboard, book or resource.
 *
 * `viewAllHref` points at `/resources?mine=true` rather than a
 * dedicated "my uploads" page — Resources.jsx (Phase 10 M1) already
 * supports that exact filter, so there's no second page to build or
 * keep in sync.
 */
const ActivityResourceRow = ({
  title,
  icon: Icon,
  resources,
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
            <Skeleton key={index} className="h-32 w-56 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : resources && resources.length > 0 ? (
        <div className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              variant="compact"
            />
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

export default ActivityResourceRow;
