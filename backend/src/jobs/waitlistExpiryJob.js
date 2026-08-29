import cron from "node-cron";
import Waitlist from "../models/Waitlist.js";
import Book from "../models/Book.js";
import { WAITLIST_STATUS } from "../constants/waitlistStatus.js";
import { COPY_STATUS } from "../constants/copyStatus.js";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import * as bookCopyService from "../services/bookCopyService.js";
import * as notificationService from "../services/notificationService.js";

// Runs every 15 minutes — frequent enough to keep a claim-window
// measured in hours (LibrarySettings.waitlistClaimWindowHours,
// default 48h) feeling responsive without needing per-minute
// precision. This replaces what Phase 6 M3 had to do lazily on-read
// (there was no scheduler yet); a real scheduler now exists (see M1),
// so this is a genuine improvement over that constraint — the
// *existing* lazy-expiry paths (physical request collection-window
// expiry) are deliberately left untouched here, a separate candidate
// for a future follow-up, not done in this milestone.
const SWEEP_INTERVAL_CRON = "*/15 * * * *";

export const runWaitlistExpirySweep = async () => {
  const expired = await Waitlist.find({
    status: WAITLIST_STATUS.NOTIFIED,
    claimExpiresAt: { $lt: new Date() },
  });

  if (expired.length === 0) return { expired: 0 };

  for (const entry of expired) {
    entry.status = WAITLIST_STATUS.EXPIRED;
    await entry.save();

    // Releasing the copy back to AVAILABLE cascades to the next
    // waiter automatically, via bookCopyService.updateCopy()'s
    // promotion hook — this loop doesn't need its own cascade logic.
    if (entry.reservedCopy) {
      await bookCopyService.updateCopy(entry.reservedCopy, { status: COPY_STATUS.AVAILABLE });
    }

    const book = await Book.findById(entry.book).select("title").lean();
    await notificationService.notify({
      user: entry.user,
      category: NOTIFICATION_CATEGORIES.CIRCULATION,
      type: NOTIFICATION_TYPES.WAITLIST_EXPIRED,
      title: "Your hold expired",
      message: `Your held copy of "${book?.title ?? "a book"}" wasn't claimed in time and has gone to the next person in line.`,
      link: "/waitlist",
      relatedEntity: { kind: "Waitlist", id: entry._id },
    });
  }

  return { expired: expired.length };
};

export const startWaitlistExpiryJob = () => {
  cron.schedule(SWEEP_INTERVAL_CRON, () => {
    runWaitlistExpirySweep().catch((error) => {
      console.error("[waitlistExpiryJob] Sweep failed:", error.message);
    });
  });
};
