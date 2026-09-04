/**
 * Access visibility of a Resource record.
 * - private: only its owner or a librarian can read it (the default —
 *   an upload only becomes visible to everyone else once its owner
 *   deliberately flips it)
 * - public: any authenticated role can read it
 *
 * Unlike Book.visibility (Phase 2), this is actually enforced on every
 * read/modify path — see resourceService.js.
 */
export const RESOURCE_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
};

export const RESOURCE_VISIBILITY_VALUES = Object.values(RESOURCE_VISIBILITY);
