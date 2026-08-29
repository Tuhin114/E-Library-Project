export const WAITLIST_STATUS = {
  WAITING: "waiting",
  // A copy has been reserved specifically for this entry and the user
  // has a limited window (LibrarySettings.waitlistClaimWindowHours) to
  // convert it into an actual request before it's released back.
  NOTIFIED: "notified",
  FULFILLED: "fulfilled",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

export const WAITLIST_STATUS_VALUES = Object.values(WAITLIST_STATUS);

// The two statuses that still occupy a place in the active queue —
// used everywhere "does this user already have a live entry for this
// book" or "is anyone still waiting on this book" needs checking.
export const ACTIVE_WAITLIST_STATUSES = [
  WAITLIST_STATUS.WAITING,
  WAITLIST_STATUS.NOTIFIED,
];
