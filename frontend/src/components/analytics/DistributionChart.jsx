import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Supersedes both `DistributionBarList.jsx` (category/author distribution)
 * and `LabeledBarList.jsx` (report reason breakdown) — those two were
 * already near-identical hand-rolled bars with only their row-shape
 * differing (a populated ref object vs. a plain string label). Callers
 * now normalize to `{ label, value }` before passing in, so one real
 * chart component covers both cases instead of two near-duplicate
 * hand-rolled ones.
 *
 * Horizontal bars (`layout="vertical"` in recharts' own inverted
 * naming) rather than vertical columns — labels here are text
 * (category/author/reason names), which reads far better as a row
 * label than rotated/truncated column-axis text.
 */
const DistributionChart = ({ rows, isLoading, emptyText, height }) => {
  if (isLoading) {
    return <Skeleton className="w-full rounded-2xl" style={{ height: height || 220 }} />;
  }

  if (!rows || rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  const chartHeight = height || Math.max(rows.length * 32, 120);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent) / 0.15)" }}
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--popover))",
            color: "hsl(var(--popover-foreground))",
            fontSize: "0.75rem",
          }}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DistributionChart;
