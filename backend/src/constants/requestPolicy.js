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

// M5 — the default safety buffer the automatic approval engine applies
// on top of every existing commitment's return/due date before treating
// a copy as provably free for a new request. Overridable per-library via
// LibrarySettings.autoApprovalBufferDays; this is only the fallback
// default a brand-new settings document is created with.
export const DEFAULT_AUTO_APPROVAL_BUFFER_DAYS = 1;

// M2 (Phase 7) — fallback defaults for a brand-new LibrarySettings
// document; all three are overridable per-library via the settings
// endpoint (see librarySettingsValidator.js).
export const DEFAULT_MAX_RENEWALS = 2;
export const DEFAULT_RENEWAL_EXTENSION_DAYS = 7;
export const DEFAULT_WAITLIST_CLAIM_WINDOW_HOURS = 48;
