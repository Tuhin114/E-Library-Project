import mongoose from "mongoose";
import {
  WAITLIST_STATUS,
  WAITLIST_STATUS_VALUES,
  ACTIVE_WAITLIST_STATUSES,
} from "../constants/waitlistStatus.js";

const waitlistSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: WAITLIST_STATUS_VALUES,
      default: WAITLIST_STATUS.WAITING,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    claimExpiresAt: {
      type: Date,
      default: null,
    },
    // Set the moment this entry is promoted from waiting to notified —
    // the specific BookCopy flipped to `reserved` for this user. Freed
    // back to `available` (see bookCopyService/waitlistService) if the
    // hold expires or is cancelled before being claimed.
    reservedCopy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCopy",
      default: null,
    },
    // Set once claimed — the PhysicalRequest the claim produced.
    fulfilledRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhysicalRequest",
      default: null,
    },
  },
  { timestamps: true },
);

// One active (waiting/notified) entry per user per book — same
// duplicate-guard pattern Review uses for (book, user), but partial so
// a user can rejoin after their earlier entry finished (fulfilled,
// expired, or cancelled).
waitlistSchema.index(
  { book: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ACTIVE_WAITLIST_STATUSES } },
  },
);

// Powers the FIFO queue ordering (oldest waiting entry first) and the
// librarian queue-for-a-book view.
waitlistSchema.index({ book: 1, status: 1, createdAt: 1 });

export default mongoose.model("Waitlist", waitlistSchema);
