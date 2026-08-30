import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, UserCheck, Trophy, BadgeCheck, BookMarked, AlertOctagon } from "lucide-react";
import { fetchEngagementAnalytics } from "@/store/slices/analyticsSlice";
import { exportEngagementAnalytics } from "@/services/analyticsService";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import TopContributorsList from "@/components/analytics/TopContributorsList";
import TopBorrowersList from "@/components/analytics/TopBorrowersList";
import TopFeePayersList from "@/components/analytics/TopFeePayersList";
import LabeledBarList from "@/components/analytics/LabeledBarList";
import ExportButton from "@/components/analytics/ExportButton";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

/**
 * `rangeControl` slot lets the parent decide where the range Select
 * renders — the standalone page puts it in its own PageHeader; the
 * unified dashboard puts one shared Select above all three tabs
 * instead of duplicating it per tab. The range *state* itself still
 * lives here, not in the parent, since only this section's data
 * depends on it.
 */
const EngagementAnalyticsSection = ({ renderRangeControl }) => {
  const dispatch = useDispatch();
  const { engagement, engagementStatus } = useSelector((state) => state.analytics);
  const [range, setRange] = useState("30d");
  const isLoading = engagementStatus === "loading" || engagementStatus === "idle";

  useEffect(() => {
    dispatch(fetchEngagementAnalytics({ range }));
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

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {engagement?.totalUsers ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Total accounts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {engagement?.activeUserCount ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Active in this period
                <span className="ml-1 text-muted-foreground/70">
                  (viewed or read a book — not a login count)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Phase 8 M3 — library-wide on-time-return rate. Scoped to
            returns in this period; see
            engagementAnalyticsService.getOnTimeReturnRate. */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <BadgeCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {engagement?.onTimeReturnRate != null ? `${engagement.onTimeReturnRate}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">On-time return rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-end">
            <ExportButton
              exportFn={exportEngagementAnalytics}
              dataset="signupsOverTime"
              params={{ range }}
              label="New Signups"
            />
          </div>
          <TimeSeriesChart
            title="New Signups"
            series={engagement?.signupsOverTime}
            isLoading={isLoading}
            emptyText="No signups in this period."
          />
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-end">
            <ExportButton
              exportFn={exportEngagementAnalytics}
              dataset="reviewsOverTime"
              params={{ range }}
              label="Reviews Submitted"
            />
          </div>
          <TimeSeriesChart
            title="Reviews Submitted"
            series={engagement?.reviewsOverTime}
            isLoading={isLoading}
            emptyText="No reviews submitted in this period."
          />
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-end">
            <ExportButton
              exportFn={exportEngagementAnalytics}
              dataset="communityPostsOverTime"
              params={{ range }}
              label="Community Posts"
            />
          </div>
          <TimeSeriesChart
            title="Community Posts"
            series={engagement?.communityPostsOverTime}
            isLoading={isLoading}
            emptyText="No discussion or forum activity in this period."
          />
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Top Contributors
            </h2>
          </div>
          <ExportButton
            exportFn={exportEngagementAnalytics}
            dataset="topContributors"
            params={{ range }}
            label="Top Contributors"
          />
        </div>
        <TopContributorsList
          contributors={engagement?.topContributors}
          isLoading={isLoading}
          emptyText="No reviews, discussions, or forum posts in this period."
        />
      </Card>

      {/* Phase 8 M3 — Borrower & Risk Analytics. Lives in this section
          rather than a separate tab: "who's actually using the library"
          is the same question this file already answers for community
          activity, just asked about circulation instead. */}
      <div className="mb-6 mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Top Borrowers
              </h2>
            </div>
            <ExportButton
              exportFn={exportEngagementAnalytics}
              dataset="topBorrowers"
              params={{ range }}
              label="Top Borrowers"
            />
          </div>
          <TopBorrowersList
            borrowers={engagement?.topBorrowers}
            isLoading={isLoading}
            emptyText="No loans collected in this period."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-destructive" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                At-Risk Students
              </h2>
            </div>
            <ExportButton
              exportFn={exportEngagementAnalytics}
              dataset="atRiskStudents"
              params={{ range }}
              label="At-Risk Students"
            />
          </div>
          {/* Reuses TopFeePayersList as-is: an at-risk entry's fees are
              all outstanding by definition (see
              engagementAnalyticsService.getAtRiskStudents), so mapping
              outstandingAmount into both totalAmount and
              outstandingAmount is accurate, not a hack — the component's
              existing "outstanding" highlight fits this list natively. */}
          <TopFeePayersList
            payers={engagement?.atRiskStudents?.map((entry) => ({
              user: entry.user,
              totalAmount: entry.outstandingAmount,
              outstandingAmount: entry.outstandingAmount,
              feeCount: entry.outstandingFeeCount,
            }))}
            isLoading={isLoading}
            emptyText="No students currently have an outstanding fee."
          />
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Borrowing Frequency
            </h2>
          </div>
          <ExportButton
            exportFn={exportEngagementAnalytics}
            dataset="borrowingFrequencyDistribution"
            params={{ range }}
            label="Borrowing Frequency"
          />
        </div>
        <LabeledBarList
          rows={engagement?.borrowingFrequencyDistribution}
          isLoading={isLoading}
          emptyText="No borrowing-eligible accounts yet."
          formatLabel={(row) => `${row.label} loans`}
        />
      </Card>
    </>
  );
};

export default EngagementAnalyticsSection;
