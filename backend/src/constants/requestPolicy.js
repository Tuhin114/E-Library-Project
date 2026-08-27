// A student can request a physical copy for at most this many days —
// keeps a single request from tying up a copy indefinitely. Deliberately
// a plain constant, not a librarian-configurable setting, in M2; revisit
// if a real need for per-library tuning shows up.
export const MAX_LOAN_DURATION_DAYS = 21;

// M3 — how many days past requestedCollectionDate an approved request
// stays valid before it auto-expires from a no-show. Checked lazily (see
// physicalRequestService.expireStaleApprovals), not via a background job
// — this app has no job scheduler yet, and a lazy check on every read is
// an honest, simple substitute until one exists.
export const COLLECTION_GRACE_DAYS = 3;
