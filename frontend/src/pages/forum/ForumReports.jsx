import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ExternalLink } from "lucide-react";
import { fetchReports, resolveReport } from "@/store/slices/forumSlice";
import { REPORT_REASON_OPTIONS } from "@/constants/reportReasons";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";

const reasonLabel = (value) =>
  REPORT_REASON_OPTIONS.find((option) => option.value === value)?.label || value;

// Resource-target reports carry `resourceId` instead of `threadId` in
// their preview (see forumReportService.listOpenReports, Phase 10 M2)
// — this is the one place that shape difference has to be handled.
const buildViewLink = (report) => {
  if (!report.target) return null;
  return report.targetType === "resource"
    ? `/resources/${report.target.resourceId}`
    : `/forum/${report.target.threadId}`;
};

const previewText = (report) => {
  if (!report.target) return "This content was already deleted.";
  return report.target.title || report.target.message;
};

const ForumReports = () => {
  const dispatch = useDispatch();
  const { reports, reportsStatus } = useSelector((state) => state.forum);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="Forum Reports"
        description="Content flagged by the community, awaiting review."
      />

      {reportsStatus === "loading" ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report._id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="warning">{reasonLabel(report.reason)}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {report.targetType}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/90">
                    {previewText(report)}
                  </p>
                  {report.details && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Reporter note: {report.details}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reported by {report.reportedBy?.name}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {buildViewLink(report) && (
                    <Link to={buildViewLink(report)}>
                      <Button type="button" variant="ghost" size="sm">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(resolveReport(report._id))}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No open reports"
          description="The forum queue is clear."
        />
      )}
    </PageContainer>
  );
};

export default ForumReports;
