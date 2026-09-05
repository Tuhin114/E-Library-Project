import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Same visual language as TopBorrowersList/TopContributorsList/
 * TopFeePayersList — numbered rows, avatar, divider list — adapted for
 * a single upload count instead of a rate or currency figure.
 */
const TopUploadersList = ({ uploaders, isLoading, emptyText }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!uploaders || uploaders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-2xl border border-border">
      {uploaders.map((entry, index) => (
        <li key={entry.user._id} className="flex items-center gap-3 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-center font-display text-xs font-bold text-secondary-foreground">
            {index + 1}
          </span>
          <Avatar src={entry.user.avatar?.url} name={entry.user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{entry.user.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">
              {entry.user.role}
            </p>
          </div>
          <span className="shrink-0 font-display text-sm font-bold text-foreground">
            {entry.uploadCount} {entry.uploadCount === 1 ? "upload" : "uploads"}
          </span>
        </li>
      ))}
    </ol>
  );
};

export default TopUploadersList;
