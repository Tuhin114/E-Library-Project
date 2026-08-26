export const REQUEST_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export const REQUEST_STATUS_BADGE_VARIANT = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  cancelled: "secondary",
};
