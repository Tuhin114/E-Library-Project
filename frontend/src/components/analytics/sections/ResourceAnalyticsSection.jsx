import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Users,
  ListChecks,
  Layers,
  Globe,
  BookMarked,
  Bookmark,
  Award,
} from "lucide-react";
import { fetchResourceAnalytics } from "@/store/slices/analyticsSlice";
import { exportResourceAnalytics } from "@/services/analyticsService";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import LabeledBarList from "@/components/analytics/LabeledBarList";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import AnalyticsResourceList from "@/components/analytics/AnalyticsResourceList";
import TopUploadersList from "@/components/analytics/TopUploadersList";
import ExportButton from "@/components/analytics/ExportButton";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

/**
 * Same renderRangeControl slot pattern every other analytics section
 * uses — the standalone page puts it in its own PageHeader, the
 * unified dashboard puts it above the tabs.
 *
 * `range` only scopes uploadsOverTime and topUploaders (the two
 * genuinely time-bound questions: "uploads lately" and "who's been
 * contributing lately"). visibilitySplit, resourceTypeDistribution,
 * uploadsByRole, subjectDistribution, mostSavedResources, and
 * savedListAdoption are all real-time snapshots of the collection's
 * current shape — the range selector doesn't affect them, same split
 * resourceAnalyticsService.js itself documents.
 */
const ResourceAnalyticsSection = ({ renderRangeControl }) => {
  const dispatch = useDispatch();
  const { resource, resourceStatus } = useSelector((state) => state.analytics);
  const [range, setRange] = useState("30d");
  const isLoading = resourceStatus === "loading" || resourceStatus === "idle";

  useEffect(() => {
    dispatch(fetchResourceAnalytics({ range }));
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

  const adoption = resource?.savedListAdoption;

  return (
    <>
      {renderRangeControl?.(rangeControl)}

      {/* Real-time snapshot stats — not range-scoped, see the note above. */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {resource?.totalResources ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Total resources</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <Bookmark className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {adoption?.totalLists ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Saved lists created</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {adoption?.avgItemsPerList ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg items per list</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <ListChecks className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {adoption?.listsWithZeroItems ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Empty lists</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Uploads Over Time
            </h2>
          </div>
          <ExportButton
            exportFn={exportResourceAnalytics}
            dataset="uploadsOverTime"
            params={{ range }}
            label="Uploads Over Time"
          />
        </div>
        <TimeSeriesChart
          title="Resources Uploaded"
          series={resource?.uploadsOverTime}
          isLoading={isLoading}
          emptyText="No resources uploaded in this period."
        />
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Public vs Private
              </h2>
            </div>
            <ExportButton
              exportFn={exportResourceAnalytics}
              dataset="visibilitySplit"
              params={{ range }}
              label="Public vs Private"
            />
          </div>
          <LabeledBarList
            rows={resource?.visibilitySplit}
            isLoading={isLoading}
            emptyText="No resources uploaded yet."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Resource Type Mix
              </h2>
            </div>
            <ExportButton
              exportFn={exportResourceAnalytics}
              dataset="resourceTypeDistribution"
              params={{ range }}
              label="Resource Type Mix"
            />
          </div>
          <LabeledBarList
            rows={resource?.resourceTypeDistribution}
            isLoading={isLoading}
            emptyText="No resources uploaded yet."
          />
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Uploads by Role
              </h2>
            </div>
            <ExportButton
              exportFn={exportResourceAnalytics}
              dataset="uploadsByRole"
              params={{ range }}
              label="Uploads by Role"
            />
          </div>
          <LabeledBarList
            rows={resource?.uploadsByRole}
            isLoading={isLoading}
            emptyText="No resources uploaded yet."
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Top Subjects
              </h2>
            </div>
            <ExportButton
              exportFn={exportResourceAnalytics}
              dataset="subjectDistribution"
              params={{ range }}
              label="Top Subjects"
            />
          </div>
          <LabeledBarList
            rows={resource?.subjectDistribution}
            isLoading={isLoading}
            emptyText="No resource has a subject set yet."
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Most Saved Resources
              </h2>
            </div>
            <ExportButton
              exportFn={exportResourceAnalytics}
              dataset="mostSavedResources"
              params={{ range }}
              label="Most Saved Resources"
            />
          </div>
          <AnalyticsResourceList
            resources={resource?.mostSavedResources}
            isLoading={isLoading}
            emptyText="No resource has been saved to a list yet."
            metricSuffix="saves"
          />
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                Top Uploaders
              </h2>
            </div>
            <ExportButton
              exportFn={exportResourceAnalytics}
              dataset="topUploaders"
              params={{ range }}
              label="Top Uploaders"
            />
          </div>
          <TopUploadersList
            uploaders={resource?.topUploaders}
            isLoading={isLoading}
            emptyText="No resources uploaded in this period."
          />
        </Card>
      </div>
    </>
  );
};

export default ResourceAnalyticsSection;
