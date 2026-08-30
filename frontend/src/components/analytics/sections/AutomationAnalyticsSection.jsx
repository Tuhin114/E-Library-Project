import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Hourglass, Clock, Bot, ListTree, Bell, BellRing } from "lucide-react";
import { fetchAutomationAnalytics } from "@/store/slices/analyticsSlice";
import { exportAutomationAnalytics } from "@/services/analyticsService";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LabeledBarList from "@/components/analytics/LabeledBarList";
import ExportButton from "@/components/analytics/ExportButton";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const formatPercentValue = (row) => `${row.count}%`;

// Same renderRangeControl slot pattern every other analytics section
// already uses — the standalone page puts it in its own PageHeader, the
// unified dashboard puts it above the tabs.
const AutomationAnalyticsSection = ({ renderRangeControl }) => {
  const dispatch = useDispatch();
  const { automation, automationStatus } = useSelector((state) => state.analytics);
  const [range, setRange] = useState("30d");
  const isLoading = automationStatus === "loading" || automationStatus === "idle";

  useEffect(() => {
    dispatch(fetchAutomationAnalytics({ range }));
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

  return (
    <>
      {renderRangeControl?.(rangeControl)}

      {/* Pending review is deliberately real-time (not range-scoped) —
          see automationAnalyticsService.getPendingReviewCount. */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <Hourglass className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {automation?.pendingReviewCount ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Auto-flagged requests awaiting review
              </p>
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
                {automation?.avgHoursToClaim ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg hours to claim a hold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Approval Engine
              </h2>
            </div>
            <ExportButton
              exportFn={exportAutomationAnalytics}
              dataset="approvalEngineBreakdown"
              params={{ range }}
              label="Approval Engine"
            />
          </div>
          <LabeledBarList
            rows={automation?.approvalEngineBreakdown}
            isLoading={isLoading}
            emptyText="No requests submitted in this period."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListTree className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Waitlist Funnel
              </h2>
            </div>
            <ExportButton
              exportFn={exportAutomationAnalytics}
              dataset="waitlistFunnel"
              params={{ range }}
              label="Waitlist Funnel"
            />
          </div>
          <LabeledBarList
            rows={automation?.waitlistFunnel}
            isLoading={isLoading}
            emptyText="No waitlist entries created in this period."
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Notifications Sent
              </h2>
            </div>
            <ExportButton
              exportFn={exportAutomationAnalytics}
              dataset="notificationsSentByCategory"
              params={{ range }}
              label="Notifications Sent"
            />
          </div>
          <LabeledBarList
            rows={automation?.notificationsSentByCategory}
            isLoading={isLoading}
            emptyText="No notifications sent in this period."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Notification Read Rate
              </h2>
            </div>
            <ExportButton
              exportFn={exportAutomationAnalytics}
              dataset="notificationReadRateByCategory"
              params={{ range }}
              label="Notification Read Rate"
            />
          </div>
          <LabeledBarList
            rows={automation?.notificationReadRateByCategory}
            isLoading={isLoading}
            emptyText="No notifications sent in this period."
            formatValue={formatPercentValue}
          />
        </Card>
      </div>
    </>
  );
};

export default AutomationAnalyticsSection;
