import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Same visual language as TopFeePayersList/TopContributorsList —
 * numbered rows, avatar, divider list — adapted for loan count + each
 * borrower's own on-time-return rate instead of currency.
 * onTimeReturnRate is null (not 0) when the borrower has no returned
 * loans yet in range; shown as "no returns yet" rather than a
 * misleading 0%.
 */
const TopBorrowersList = ({ borrowers, isLoading, emptyText }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!borrowers || borrowers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-2xl border border-border">
      {borrowers.map((entry, index) => (
        <li key={entry.user._id} className="flex items-center gap-3 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-center font-display text-xs font-bold text-secondary-foreground">
            {index + 1}
          </span>
          <Avatar src={entry.user.avatar?.url} name={entry.user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{entry.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {entry.onTimeReturnRate == null
                ? "No returns yet"
                : `${entry.onTimeReturnRate}% returned on time`}
            </p>
          </div>
          <span className="shrink-0 font-display text-sm font-bold text-foreground">
            {entry.loanCount} {entry.loanCount === 1 ? "loan" : "loans"}
          </span>
        </li>
      ))}
    </ol>
  );
};

export default TopBorrowersList;
