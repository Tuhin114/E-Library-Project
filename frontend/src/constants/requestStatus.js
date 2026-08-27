export const REQUEST_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
  // Added in M3
  { value: "collected", label: "Collected" },
  { value: "expired", label: "Expired" },
];

export const REQUEST_STATUS_BADGE_VARIANT = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  cancelled: "secondary",
  collected: "default",
  expired: "secondary",
};
