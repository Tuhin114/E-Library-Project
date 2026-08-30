import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value) => `$${value.toFixed(2)}`;

/**
 * Same visual language as TopContributorsList, adapted for currency
 * instead of a contribution-type breakdown — totalAmount includes both
 * paid and outstanding fees in the period, outstandingAmount narrows to
 * what's still owed right now, which is what a librarian actually needs
 * to act on.
 */
const TopFeePayersList = ({ payers, isLoading, emptyText }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!payers || payers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-2xl border border-border">
      {payers.map((entry, index) => (
        <li key={entry.user._id} className="flex items-center gap-3 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-center font-display text-xs font-bold text-secondary-foreground">
            {index + 1}
          </span>
          <Avatar src={entry.user.avatar?.url} name={entry.user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{entry.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {entry.feeCount} {entry.feeCount === 1 ? "fee" : "fees"}
              {entry.outstandingAmount > 0 && (
                <>
                  {" "}
                  &middot;{" "}
                  <span className="text-destructive">
                    {formatCurrency(entry.outstandingAmount)} outstanding
                  </span>
                </>
              )}
            </p>
          </div>
          <span className="shrink-0 font-display text-sm font-bold text-foreground">
            {formatCurrency(entry.totalAmount)}
          </span>
        </li>
      ))}
    </ol>
  );
};

export default TopFeePayersList;
