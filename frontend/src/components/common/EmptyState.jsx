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
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/20 py-16 text-center",
        className,
      )}
    >
      <Icon className="h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
};

export default EmptyState;
