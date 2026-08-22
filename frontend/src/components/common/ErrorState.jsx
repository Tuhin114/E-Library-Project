import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

/**
 * Generic inline error placeholder for any fetch that failed — pairs with
 * EmptyState (no data) and Skeleton (loading) to give every list/detail
 * page a consistent 3-state pattern: loading / error / empty / data.
 */
const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 py-16 text-center",
      className,
    )}
  >
    <AlertTriangle className="h-9 w-9 text-destructive" strokeWidth={1.5} />
    <p className="max-w-sm text-sm font-medium text-destructive">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
