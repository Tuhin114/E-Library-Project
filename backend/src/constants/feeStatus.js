export const FEE_STATUS = {
  OUTSTANDING: "outstanding",
  PAID: "paid",
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
