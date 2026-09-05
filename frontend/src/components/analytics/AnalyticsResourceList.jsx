import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RESOURCE_TYPE_LABELS } from "@/constants/resourceType";

/**
 * Same reasoning as AnalyticsBookList — rank order is the point, so a
 * numbered vertical list, not a card grid. No cover image slot (Resource
 * has none); a fixed FileText icon fills that spot instead of a
 * conditional image/placeholder branch.
 */
const AnalyticsResourceList = ({
  resources,
  isLoading,
  emptyText,
  metricSuffix,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-2xl border border-border">
      {resources.map((resource, index) => (
        <li key={resource._id}>
          <Link
            to={`/resources/${resource._id}`}
            className="flex items-center gap-3 p-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-accent/15"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-center font-display text-xs font-bold text-secondary-foreground">
              {index + 1}
            </span>

            <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {resource.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {RESOURCE_TYPE_LABELS[resource.resourceType]}
              </p>
            </div>

            <span className="shrink-0 whitespace-nowrap font-display text-sm font-bold text-foreground">
              {resource.metricValue}
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

export default AnalyticsResourceList;
