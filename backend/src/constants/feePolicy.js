// Simple flat daily rate with a hard cap — deliberately not a
// librarian-configurable setting in M4, same reasoning
// MAX_LOAN_DURATION_DAYS in requestPolicy.js used: a plain constant now,
// revisit if a real need for per-library tuning shows up.
export const DAILY_LATE_FEE_RATE = 0.5;

// Caps the fee regardless of how many days a book sits unreturned —
// without this, a book returned six months late would generate a fee
// wildly disproportionate to a paperback's replacement cost. Lost-book
// handling (a genuinely different fee — replacement cost, not a per-day
// rate) is out of scope for M4; see M6 in the milestone plan.
export const MAX_LATE_FEE = 15;

// M3 (Phase 7) — fallback used to prefill a damage/lost fee's amount
// when the specific book has no Book.replacementCost of its own set.
// Overridable per-library via LibrarySettings.defaultReplacementCost.
export const DEFAULT_REPLACEMENT_COST = 25;
