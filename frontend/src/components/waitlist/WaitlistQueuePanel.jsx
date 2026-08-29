import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock } from "lucide-react";
import { fetchWaitlistForBook } from "@/store/slices/waitlistSlice";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import {
  WAITLIST_STATUS_OPTIONS,
  WAITLIST_STATUS_BADGE_VARIANT,
} from "@/constants/waitlistStatus";

const statusLabel = (status) =>
  WAITLIST_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// Only WAITING and NOTIFIED entries are ever returned by GET
// /books/:id/waitlist (see waitlistService.listForBook on the
// backend) — fulfilled/expired/cancelled entries don't occupy a
// current queue slot, so there's nothing for a librarian to act on
// for those here.
const WaitlistQueuePanel = ({ bookId }) => {
  const dispatch = useDispatch();
  const { bookQueue, bookQueueStatus, bookQueueBookId } = useSelector((state) => state.waitlist);

  useEffect(() => {
    dispatch(fetchWaitlistForBook(bookId));
  }, [dispatch, bookId]);

  const isCurrentBook = bookQueueBookId === bookId;
  const entries = isCurrentBook ? bookQueue : [];

  return (
    <div className="rounded-2xl border border-border p-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-display text-sm font-semibold text-foreground">Waitlist Queue</h3>
      </div>

      {bookQueueStatus === "loading" && !isCurrentBook ? (
        <Skeleton className="h-16 w-full" />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No one is waiting"
          description="Readers can join once every physical copy is checked out."
          className="py-8"
        />
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-2.5 text-sm"
            >
              <div className="flex items-center gap-3">
                {entry.status === "waiting" && (
                  <span className="w-6 shrink-0 text-center font-display font-semibold text-muted-foreground">
                    #{entry.position}
                  </span>
                )}
                <span className="font-medium text-foreground">{entry.user?.name}</span>
                <span className="text-xs text-muted-foreground">{entry.user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                {entry.status === "notified" && entry.claimExpiresAt && (
                  <span className="text-xs text-muted-foreground">
                    Claim by {formatDateTime(entry.claimExpiresAt)}
                  </span>
                )}
                <Badge variant={WAITLIST_STATUS_BADGE_VARIANT[entry.status]} className="capitalize">
                  {statusLabel(entry.status)}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WaitlistQueuePanel;
