import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, UserCheck, Trophy } from "lucide-react";
import { fetchEngagementAnalytics } from "@/store/slices/analyticsSlice";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Sparkline from "@/components/analytics/Sparkline";
import TopContributorsList from "@/components/analytics/TopContributorsList";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const EngagementAnalytics = () => {
  const dispatch = useDispatch();
  const { engagement, engagementStatus } = useSelector((state) => state.analytics);
  const [range, setRange] = useState("30d");
  const isLoading = engagementStatus === "loading" || engagementStatus === "idle";

  useEffect(() => {
    dispatch(fetchEngagementAnalytics({ range }));
  }, [dispatch, range]);

  return (
    <PageContainer>
      <PageHeader
        title="Engagement Analytics"
        description="Signups, activity, and community contribution over time."
        actions={
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
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <Sparkline
            title="New Signups"
            series={engagement?.signupsOverTime}
            isLoading={isLoading}
            emptyText="No signups in this period."
          />
        </Card>
        <Card className="p-4">
          <Sparkline
            title="Reviews Submitted"
            series={engagement?.reviewsOverTime}
            isLoading={isLoading}
            emptyText="No reviews submitted in this period."
          />
        </Card>
        <Card className="p-4">
          <Sparkline
            title="Community Posts"
            series={engagement?.communityPostsOverTime}
            isLoading={isLoading}
            emptyText="No discussion or forum activity in this period."
          />
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
            Top Contributors
          </h2>
        </div>
        <TopContributorsList
          contributors={engagement?.topContributors}
          isLoading={isLoading}
          emptyText="No reviews, discussions, or forum posts in this period."
        />
      </Card>
    </PageContainer>
  );
};

export default EngagementAnalytics;
