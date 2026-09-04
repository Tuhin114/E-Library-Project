import { FileText } from "lucide-react";
import ResourceCard from "./ResourceCard";
import { Skeleton } from "../ui/skeleton";
import EmptyState from "../common/EmptyState";

const GRID_CLASSES = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

const ResourceGrid = ({
  resources,
  isLoading,
  emptyTitle = "No resources found",
  emptyDescription = "",
}) => {
  if (isLoading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {resources.map((resource) => (
        <ResourceCard key={resource._id} resource={resource} />
      ))}
    </div>
  );
};

export default ResourceGrid;
