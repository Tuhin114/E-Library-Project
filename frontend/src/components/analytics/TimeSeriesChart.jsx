import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const formatShortDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/**
 * Superseded `components/analytics/Sparkline.jsx` (hand-rolled SVG
 * polyline, no axes/tooltip) — recharts was deliberately deferred
 * through M2/M3/M4 until there was enough data across the app to
 * justify the dependency. Keeps Sparkline's prop shape
 * (title/series/isLoading/emptyText/valueSuffix) so every call site
 * that used Sparkline is a drop-in swap, not a rewrite.
 *
 * Colors are passed as literal `hsl(var(--x))` strings rather than
 * Tailwind classes — recharts renders raw SVG internally and most of
 * its elements don't accept `className` for fill/stroke, so this is
 * the only way to stay on the app's actual theme tokens instead of a
 * hardcoded hex that would drift from the light/dark palette.
 */
const TimeSeriesChart = ({ title, series, isLoading, emptyText, valueSuffix }) => {
  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
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

  const total = series.reduce((sum, point) => sum + point.count, 0);
  const latest = series[series.length - 1];

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          Total: <span className="font-display font-bold text-foreground">{total}</span>
        </p>
      </div>

      <div className="mb-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-bold leading-none text-foreground">
          {latest.count}
          {valueSuffix && (
            <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">
              {valueSuffix}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">on {formatShortDate(latest.date)}</p>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={series} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            labelFormatter={formatShortDate}
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
              fontSize: "0.75rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;
