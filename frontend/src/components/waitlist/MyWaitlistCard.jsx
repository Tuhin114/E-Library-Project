import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WAITLIST_STATUS_OPTIONS,
  WAITLIST_STATUS_BADGE_VARIANT,
} from "@/constants/waitlistStatus";
import { leaveWaitlist, claimWaitlistEntry } from "@/store/slices/waitlistSlice";

const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const statusLabel = (status) =>
  WAITLIST_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

const MyWaitlistCard = ({ entry }) => {
  const dispatch = useDispatch();
  const { actionPendingId } = useSelector((state) => state.waitlist);
  const isPending = actionPendingId === entry._id;
  const canLeave = entry.status === "waiting" || entry.status === "notified";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={WAITLIST_STATUS_BADGE_VARIANT[entry.status]} className="capitalize">
            {statusLabel(entry.status)}
          </Badge>
          {entry.status === "waiting" && entry.position && (
            <span className="text-xs text-muted-foreground">Position #{entry.position}</span>
          )}
          {entry.status === "notified" && entry.claimExpiresAt && (
            <span className="text-xs text-muted-foreground">
              Claim by {formatDateTime(entry.claimExpiresAt)}
            </span>
          )}
        </div>

        <Link
          to={`/books/${entry.book?._id}`}
          className="mt-1.5 block truncate font-display text-base font-semibold text-foreground hover:underline"
        >
          {entry.book?.title || "Book no longer available"}
        </Link>
      </div>

      {canLeave && (
        <div className="flex shrink-0 items-center gap-2">
          {entry.status === "notified" && (
            <Button
              size="sm"
              onClick={() => dispatch(claimWaitlistEntry({ waitlistId: entry._id }))}
              disabled={isPending}
            >
              {isPending ? "Claiming..." : "Claim"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => dispatch(leaveWaitlist(entry._id))}
            disabled={isPending}
          >
            {isPending ? "Leaving..." : "Leave"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyWaitlistCard;
