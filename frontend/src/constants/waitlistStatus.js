export const WAITLIST_STATUS_OPTIONS = [
  { value: "waiting", label: "Waiting" },
  { value: "notified", label: "Ready to claim" },
  { value: "fulfilled", label: "Claimed" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

export const WAITLIST_STATUS_BADGE_VARIANT = {
  waiting: "secondary",
  notified: "success",
  fulfilled: "default",
  expired: "destructive",
  cancelled: "secondary",
};
