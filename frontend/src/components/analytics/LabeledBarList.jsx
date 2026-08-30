import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic { label, count } version of M2's DistributionBarList, which
 * expects a populated ref object (category/author) rather than a plain
 * string label — report reasons are a fixed enum, not a ref, so that
 * component doesn't quite fit. Kept the same visual language (hand-rolled
 * bars, no charting library) rather than introducing a third pattern.
 */
const LabeledBarList = ({
  rows,
  isLoading,
  emptyText,
  formatLabel = (row) => row.label,
  formatValue = (row) => row.count,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
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

  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((row) => {
        const widthPct = row.count > 0 ? Math.max((row.count / max) * 100, 4) : 0;
        return (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-xs capitalize text-muted-foreground sm:w-40">
              {formatLabel(row)}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-display text-xs font-bold text-foreground">
              {formatValue(row)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LabeledBarList;
