import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Flag, CheckCircle2, Clock, Lock, Pin } from "lucide-react";
import { fetchModerationAnalytics } from "@/store/slices/analyticsSlice";
import { exportModerationAnalytics } from "@/services/analyticsService";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import DistributionChart from "@/components/analytics/DistributionChart";
import ExportButton from "@/components/analytics/ExportButton";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const StatTile = ({ icon: Icon, value, label, hint }) => (
  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="font-display text-lg font-bold leading-tight text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">
          {label}
          {hint && <span className="ml-1 text-muted-foreground/70">({hint})</span>}
        </p>
      </div>
    </CardContent>
  </Card>
);

const ModerationAnalyticsSection = ({ renderRangeControl }) => {
  const dispatch = useDispatch();
  const { moderation, moderationStatus } = useSelector((state) => state.analytics);
  const [range, setRange] = useState("30d");
  const isLoading = moderationStatus === "loading" || moderationStatus === "idle";

  useEffect(() => {
    dispatch(fetchModerationAnalytics({ range }));
  }, [dispatch, range]);

  const reasonRows = moderation?.reportsByReason?.map((row) => ({
    label: row.reason,
    value: row.count,
  }));

  const rangeControl = (
    <Select value={range} onValueChange={setRange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Range" />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      {renderRangeControl?.(rangeControl)}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Flag} value={moderation?.openCount ?? "—"} label="Open reports" />
        <StatTile
          icon={CheckCircle2}
          value={moderation?.resolvedCount ?? "—"}
          label="Resolved"
        />
        <StatTile
          icon={Clock}
          value={
            moderation?.avgResolutionHours != null
              ? `${moderation.avgResolutionHours}h`
              : "—"
          }
          label="Avg. resolve time"
          hint={
            moderation && moderation.resolvedWithoutTimestampCount > 0
              ? `${moderation.resolvedWithTimestampCount} of ${
                  moderation.resolvedWithTimestampCount +
                  moderation.resolvedWithoutTimestampCount
                } resolved reports`
              : undefined
          }
        />
        <StatTile icon={Lock} value={moderation?.lockedCount ?? "—"} label="Locked threads" />
      </div>

      {moderation && moderation.resolvedWithoutTimestampCount > 0 && (
        <p className="mb-6 rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-xs text-muted-foreground">
          {moderation.resolvedWithoutTimestampCount} resolved report
          {moderation.resolvedWithoutTimestampCount === 1 ? "" : "s"} predate resolve-time
          tracking and {moderation.resolvedWithoutTimestampCount === 1 ? "isn't" : "aren't"}
          {" "}included in the average above.
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-end">
            <ExportButton
              exportFn={exportModerationAnalytics}
              dataset="reportsFiledOverTime"
              params={{ range }}
              label="Reports Filed"
            />
          </div>
          <TimeSeriesChart
            title="Reports Filed"
            series={moderation?.reportsFiledOverTime}
            isLoading={isLoading}
            emptyText="No reports filed in this period."
          />
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-end">
            <ExportButton
              exportFn={exportModerationAnalytics}
              dataset="reportsResolvedOverTime"
              params={{ range }}
              label="Reports Resolved"
            />
          </div>
          <TimeSeriesChart
            title="Reports Resolved"
            series={moderation?.reportsResolvedOverTime}
            isLoading={isLoading}
            emptyText="No reports resolved in this period."
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Reports by Reason
            </h2>
            <ExportButton
              exportFn={exportModerationAnalytics}
              dataset="reportsByReason"
              params={{ range }}
              label="Reports by Reason"
            />
          </div>
          <DistributionChart
            rows={reasonRows}
            isLoading={isLoading}
            emptyText="No reports filed in this period."
          />
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-foreground">
            <Pin className="h-4 w-4 text-primary" />
            Thread Moderation
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Locked threads
              </span>
              <span className="text-sm font-semibold text-foreground">
                {moderation?.lockedCount ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Pin className="h-4 w-4" />
                Pinned threads
              </span>
              <span className="text-sm font-semibold text-foreground">
                {moderation?.pinnedCount ?? "—"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ModerationAnalyticsSection;
