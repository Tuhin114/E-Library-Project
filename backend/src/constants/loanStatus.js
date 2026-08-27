export const LOAN_STATUS = {
  ACTIVE: "active",
  // Not set anywhere yet in M3 — the return flow that sets this is M4.
  // Included now so the enum, model, and every consumer only need to be
  // defined once.
  RETURNED: "returned",
};

export const LOAN_STATUS_VALUES = Object.values(LOAN_STATUS);
