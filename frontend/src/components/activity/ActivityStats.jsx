import { Heart, BookMarked, CheckCircle2, Star, FileText, ListPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STAT_ITEMS = [
  { key: "favoritesCount", label: "Favorites", icon: Heart },
  { key: "inProgressCount", label: "In Progress", icon: BookMarked },
  { key: "completedCount", label: "Completed", icon: CheckCircle2 },
  { key: "reviewsCount", label: "Reviews Written", icon: Star },
  { key: "uploadsCount", label: "My Uploads", icon: FileText },
  { key: "savedListsCount", label: "Saved Lists", icon: ListPlus },
];

/**
 * Pure counts, no new data — every number here already exists in
 * `activity.stats` from the /me/activity response. Deliberately not
 * clickable/filterable; it's a glance-and-go summary, each section
 * below has its own "view all" link for anything deeper.
 */
const ActivityStats = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_ITEMS.map((item) => (
          <Skeleton key={item.key} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-foreground">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                {stats?.[key] ?? 0}
              </p>
              <p className="truncate text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityStats;
