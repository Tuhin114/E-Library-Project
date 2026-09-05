import { Link } from "react-router-dom";
import { FileText, Lock, Globe } from "lucide-react";
import { RESOURCE_TYPE_LABELS } from "../../constants/resourceType";
import { useAuth } from "../../hooks/useAuth";
import { Badge } from "../ui/badge";
import SaveToListButton from "./SaveToListButton";

const ResourceCard = ({ resource }) => {
  const { user } = useAuth();

  const isOwner = resource.uploadedBy?._id === user?._id;
  const isPrivate = resource.visibility === "private";
  const authorNames = (resource.authors || []).join(", ");

  return (
    <div className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-elevated">
      {/* Top section */}
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/resources/${resource._id}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary"
          aria-label={`Open ${resource.title}`}
        >
          <FileText
            className="h-5 w-5 text-muted-foreground"
            strokeWidth={1.5}
          />
        </Link>

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

      {/* Resource information is clickable */}
      <Link
        to={`/resources/${resource._id}`}
        className="flex min-h-0 flex-1 flex-col"
      >
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
      </Link>
    </div>
  );
};

export default ResourceCard;
