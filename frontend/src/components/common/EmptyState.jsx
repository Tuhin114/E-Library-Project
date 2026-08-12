import { Inbox } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Generic empty-state placeholder for lists/tables with no data.
 * Pass a lucide-react icon component via `icon` to customize per context.
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "",
  action = null,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center",
        className,
      )}
    >
      <Icon className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
};

export default EmptyState;
