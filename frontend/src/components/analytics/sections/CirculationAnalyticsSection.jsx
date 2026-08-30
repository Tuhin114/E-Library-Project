import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookMarked, AlertTriangle, Clock, CalendarClock, ListChecks, Boxes } from "lucide-react";
import { fetchCirculationAnalytics } from "@/store/slices/analyticsSlice";
import { exportCirculationAnalytics } from "@/services/analyticsService";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import LabeledBarList from "@/components/analytics/LabeledBarList";
import AnalyticsBookList from "@/components/analytics/AnalyticsBookList";
import ExportButton from "@/components/analytics/ExportButton";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

// Same renderRangeControl slot pattern EngagementAnalyticsSection
// established — the standalone page puts it in its own PageHeader, the
// unified dashboard puts it above the tabs.
const CirculationAnalyticsSection = ({ renderRangeControl }) => {
  const dispatch = useDispatch();
  const { circulation, circulationStatus } = useSelector((state) => state.analytics);
  const [range, setRange] = useState("30d");
  const isLoading = circulationStatus === "loading" || circulationStatus === "idle";

  useEffect(() => {
    dispatch(fetchCirculationAnalytics({ range }));
  }, [dispatch, range]);

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

  const approvalMixRows = circulation
    ? [
        { label: "Automatic", count: circulation.approvalMix.autoApproved },
        { label: "Manual", count: circulation.approvalMix.manual },
      ]
    : [];

  return (
    <>
      {renderRangeControl?.(rangeControl)}

      {/* Loan health is deliberately real-time (not range-scoped) —
          see circulationAnalyticsService.getLoanStatusBreakdown. */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <BookMarked className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {circulation?.loanStatusBreakdown?.find((r) => r.label === "active")?.count ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Active loans</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {circulation?.loanStatusBreakdown?.find((r) => r.label === "overdue")?.count ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Overdue now</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {circulation?.avgDaysToCollection ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg days to collection</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <CalendarClock className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {circulation?.avgLoanDurationDays ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg loan duration (days)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-end">
            <ExportButton
              exportFn={exportCirculationAnalytics}
              dataset="requestsOverTime"
              params={{ range }}
              label="Requests Over Time"
            />
          </div>
          <TimeSeriesChart
            title="Requests Submitted"
            series={circulation?.requestsOverTime}
            isLoading={isLoading}
            emptyText="No requests submitted in this period."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Request Funnel
              </h2>
            </div>
            <ExportButton
              exportFn={exportCirculationAnalytics}
              dataset="requestFunnel"
              params={{ range }}
              label="Request Funnel"
            />
          </div>
          <LabeledBarList
            rows={circulation?.requestFunnel}
            isLoading={isLoading}
            emptyText="No requests submitted in this period."
          />
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Approval Mix
            </h2>
          </div>
          <LabeledBarList
            rows={approvalMixRows}
            isLoading={isLoading}
            emptyText="No requests decided in this period."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Copy Status (library-wide)
            </h2>
            <ExportButton
              exportFn={exportCirculationAnalytics}
              dataset="copyStatusBreakdown"
              params={{ range }}
              label="Copy Status"
            />
          </div>
          <LabeledBarList
            rows={circulation?.copyStatusBreakdown}
            isLoading={isLoading}
            emptyText="No physical copies in the catalog yet."
          />
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Highest Inventory Utilization
            </h2>
          </div>
          <ExportButton
            exportFn={exportCirculationAnalytics}
            dataset="inventoryUtilization"
            params={{ range }}
            label="Inventory Utilization"
          />
        </div>
        <AnalyticsBookList
          books={circulation?.inventoryUtilization}
          isLoading={isLoading}
          emptyText="No books with physical copies yet."
          metricSuffix="issued"
        />
      </Card>
    </>
  );
};

export default CirculationAnalyticsSection;
