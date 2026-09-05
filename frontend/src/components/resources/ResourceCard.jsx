import { Link } from "react-router-dom";
import { FileText, Lock, Globe } from "lucide-react";
import { cn } from "../../lib/utils";
import { RESOURCE_TYPE_LABELS } from "../../constants/resourceType";
import { useAuth } from "../../hooks/useAuth";
import { Badge } from "../ui/badge";
import SaveToListButton from "./SaveToListButton";

/**
 * Catalog-style tile for a Resource. The visibility badge only shows
 * to the resource's own owner — seeing "Private" on someone else's
 * card would be meaningless (and, for a private resource, unreachable
 * anyway, since it never appears in another user's list in the
 * first place).
 *
 * `variant="grid"` (default) is the full-width tile used in
 * ResourceGrid/SavedListDetail; `variant="compact"` is a smaller
 * fixed-width tile for horizontally-scrolling rows (Phase 10 M4's
 * Activity Dashboard "My Uploads" row) — same convention BookCard
 * already established for its own compact variant, so the two
 * contexts share one implementation instead of drifting apart.
 */
const ResourceCard = ({ resource, variant = "grid" }) => {
  const { user } = useAuth();
  const isOwner = resource.uploadedBy?._id === user?._id;
  const isPrivate = resource.visibility === "private";
  const authorNames = (resource.authors || []).join(", ");
  const isCompact = variant === "compact";

  return (
    <Link
      to={`/resources/${resource._id}`}
      className={cn("block", isCompact && "w-56 shrink-0 snap-start")}
    >
      <div className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-elevated">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <FileText
              className="h-5 w-5 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>
          <div className="flex items-center gap-1">
            {isOwner && (
              <Badge
                variant={isPrivate ? "secondary" : "default"}
                className="gap-1 text-[10px]"
              >
                {isPrivate ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Globe className="h-3 w-3" />
                )}
                {isPrivate ? "Private" : "Public"}
              </Badge>
            )}
            <SaveToListButton resourceId={resource._id} />
          </div>
        </div>

        <h3 className="line-clamp-2 font-display text-sm font-medium leading-snug text-foreground">
          {resource.title}
        </h3>

        {authorNames && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {authorNames}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          <Badge variant="secondary" className="text-[10px]">
            {RESOURCE_TYPE_LABELS[resource.resourceType]}
          </Badge>
          {resource.subject && (
            <Badge variant="outline" className="text-[10px]">
              {resource.subject}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ResourceCard;
