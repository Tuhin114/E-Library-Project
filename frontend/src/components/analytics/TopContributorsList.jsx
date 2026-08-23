import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const BREAKDOWN_LABELS = {
  reviews: "review",
  discussions: "book discussion",
  discussionReplies: "discussion reply",
  forumThreads: "forum thread",
  forumReplies: "forum reply",
};

const formatBreakdown = (breakdown) =>
  Object.entries(breakdown)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${count} ${BREAKDOWN_LABELS[key]}${count === 1 ? "" : "s"}`)
    .join(" · ");

/**
 * "Contribution" sums five different models (reviews, per-book
 * discussions + replies, forum threads + replies) into one score —
 * deliberately unweighted (a review counts the same as a forum reply)
 * since there's no product signal yet for which type matters more.
 * The per-type breakdown line lets a librarian see the mix at a
 * glance rather than the total hiding it.
 */
const TopContributorsList = ({ contributors, isLoading, emptyText }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!contributors || contributors.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-2xl border border-border">
      {contributors.map((entry, index) => (
        <li key={entry.user._id} className="flex items-center gap-3 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-center font-display text-xs font-bold text-secondary-foreground">
            {index + 1}
          </span>
          <Avatar src={entry.user.avatar?.url} name={entry.user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{entry.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatBreakdown(entry.breakdown)}
            </p>
          </div>
          <span className="shrink-0 font-display text-sm font-bold text-foreground">
            {entry.totalContributions}
          </span>
        </li>
      ))}
    </ol>
  );
};

export default TopContributorsList;
