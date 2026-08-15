import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";

/**
 * Shared loading/error/empty/data branching for Manage* list pages.
 * Renders `children` (the page's own table/card markup) once there's
 * something to show or it's still loading; otherwise renders the
 * matching error/empty state instead.
 */
const ManageDataState = ({
  status,
  items,
  icon,
  emptyTitle,
  emptyDescription,
  createLabel,
  onCreate,
  errorMessage,
  onRetry,
  children,
}) => {
  if (status === "failed") {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (status === "succeeded" && items.length === 0) {
    return (
      <EmptyState
        icon={icon}
        title={emptyTitle}
        description={emptyDescription}
        action={
          onCreate && (
            <Button onClick={onCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {createLabel}
            </Button>
          )
        }
      />
    );
  }

  if (status === "loading" || items.length > 0) {
    return children;
  }

  return null;
};

export default ManageDataState;
