import { Skeleton } from "@/components/ui/skeleton";

const formatShortDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/**
 * Plain SVG polyline, no charting library — same call made for
 * DistributionBarList in M2. `recharts` is deliberately deferred to
 * M5 once there's three milestones' worth of data to justify adding
 * it as a dependency.
 *
 * Renders the last point's value and date prominently (what a
 * librarian glancing at this actually wants — "where are we now")
 * with the trend line as supporting context, not the other way round.
 */
const Sparkline = ({ title, series, isLoading, emptyText, valueSuffix }) => {
  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-2xl" />;
  }

  if (!series || series.length === 0) {
    return (
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
        <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      </div>
    );
  }

  const values = series.map((point) => point.count);
  const max = Math.max(...values, 1);
  const total = values.reduce((sum, v) => sum + v, 0);
  const latest = series[series.length - 1];

  const width = 100;
  const height = 32;
  const points = series
    .map((point, index) => {
      const x = series.length === 1 ? width : (index / (series.length - 1)) * width;
      const y = height - (point.count / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          Total: <span className="font-display font-bold text-foreground">{total}</span>
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <p className="font-display text-2xl font-bold leading-none text-foreground">
            {latest.count}
            {valueSuffix && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {valueSuffix}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            on {formatShortDate(latest.date)}
          </p>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-10 flex-1 text-primary"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default Sparkline;
