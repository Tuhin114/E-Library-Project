import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchMyWaitlist,
  joinWaitlist,
  leaveWaitlist,
  claimWaitlistEntry,
} from "@/store/slices/waitlistSlice";

// Same idle-fetch-on-mount convention FavoriteButton uses for
// librarySlice.favoriteIds — a few duplicate GET /me/waitlist requests
// on a page with several of these is an accepted trade-off in this
// codebase already, not a new one introduced here.
const WaitlistButton = ({ bookId }) => {
  const dispatch = useDispatch();
  const { myEntries, myEntriesStatus, actionPendingId } = useSelector((state) => state.waitlist);

  useEffect(() => {
    if (myEntriesStatus === "idle") {
      dispatch(fetchMyWaitlist());
    }
  }, [dispatch, myEntriesStatus]);

  const entry = myEntries.find(
    (e) => e.book?._id === bookId && ["waiting", "notified"].includes(e.status),
  );
  const isPending = actionPendingId === bookId || actionPendingId === entry?._id;

  if (!entry) {
    return (
      <Button
        variant="outline"
        onClick={() => dispatch(joinWaitlist(bookId))}
        disabled={isPending}
        className="gap-2"
      >
        <Clock className="h-4 w-4" />
        {isPending ? "Joining..." : "Join Waitlist"}
      </Button>
    );
  }

  if (entry.status === "notified") {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => dispatch(claimWaitlistEntry({ waitlistId: entry._id }))}
          disabled={isPending}
        >
          {isPending ? "Claiming..." : "Claim Your Copy"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(leaveWaitlist(entry._id))}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => dispatch(leaveWaitlist(entry._id))}
      disabled={isPending}
      className="gap-2"
    >
      <Clock className="h-4 w-4" />
      {isPending ? "Leaving..." : `On Waitlist (#${entry.position ?? "?"}) — Leave`}
    </Button>
  );
};

export default WaitlistButton;
