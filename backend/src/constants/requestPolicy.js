// A student can request a physical copy for at most this many days —
// keeps a single request from tying up a copy indefinitely. Deliberately
// a plain constant, not a librarian-configurable setting, in M2; revisit
// if a real need for per-library tuning shows up.
export const MAX_LOAN_DURATION_DAYS = 21;
