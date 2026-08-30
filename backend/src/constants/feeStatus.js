export const FEE_STATUS = {
  // M3 (Phase 7) — a damage/lost fee lands here first: a librarian
  // hasn't confirmed the amount yet, so it doesn't count against the
  // student and they aren't notified until it's finalized. A late fee
  // is deterministic (days overdue x rate) and skips this state
  // entirely, going straight to OUTSTANDING as it always has.
  PENDING_REVIEW: "pending_review",
  OUTSTANDING: "outstanding",
  PAID: "paid",
  // M3 (Phase 7) — a librarian can waive a fee (with a required reason)
  // from either PENDING_REVIEW or OUTSTANDING; terminal, same as PAID.
  WAIVED: "waived",
};

export const FEE_STATUS_VALUES = Object.values(FEE_STATUS);

// Deliberately not client-supplied on payment — the server derives which
// one applies from who's making the call (see feeService.payFee), so a
// student can't claim an "in_person" payment and a librarian's action is
// always attributable as staff-recorded.
export const PAYMENT_METHOD = {
  ONLINE: "online",
  IN_PERSON: "in_person",
};

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);
