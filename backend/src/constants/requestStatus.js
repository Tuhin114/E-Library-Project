export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  // Added in M3 — a request that has actually been physically handed
  // over becomes a Loan and moves here, out of "approved". "Expired" is
  // the automatic outcome of an approved request whose collection
  // window lapsed without a collection ever happening (see
  // requestPolicy.js's COLLECTION_GRACE_DAYS).
  COLLECTED: "collected",
  EXPIRED: "expired",
};

export const REQUEST_STATUS_VALUES = Object.values(REQUEST_STATUS);
