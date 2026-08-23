import { Skeleton } from "@/components/ui/skeleton";

/**
 * Hand-rolled bars (relative width via inline style, no chart library)
 * rather than pulling in recharts for one milestone — M5 (Unified
 * Analytics Dashboard) is where a real charting library gets added,
 * once there are three milestones' worth of data to actually justify
 * it. This is deliberately low-tech for now.
 */
const DistributionBarList = ({ rows, isLoading, emptyText, labelKey, labelFallback }) => {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-full rounded-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  const max = Math.max(...rows.map((row) => row.bookCount));

  return (
    <div className="space-y-2.5">
      {rows.map((row) => {
        const label = row[labelKey]?.name || labelFallback;
        const widthPct = max > 0 ? Math.max((row.bookCount / max) * 100, 4) : 0;
        return (
          <div key={row[labelKey]?._id || label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-xs text-muted-foreground sm:w-40">
              {label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-display text-xs font-bold text-foreground">
              {row.bookCount}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DistributionBarList;
