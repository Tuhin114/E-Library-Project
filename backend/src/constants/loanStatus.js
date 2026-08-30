export const LOAN_STATUS = {
  ACTIVE: "active",
  // Not set anywhere yet in M3 — the return flow that sets this is M4.
  // Included now so the enum, model, and every consumer only need to be
  // defined once.
  RETURNED: "returned",
  // M3 (Phase 7) — set by loanService.reportLoanLost(). Terminal, same
  // as RETURNED: a lost loan is never returned, but it's also no longer
  // active and shouldn't keep counting toward the student's outstanding
  // loans or block anything a returned loan wouldn't block.
  LOST: "lost",
};

export const LOAN_STATUS_VALUES = Object.values(LOAN_STATUS);
