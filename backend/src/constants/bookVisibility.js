/**
 * Access visibility of a Book record.
 * - public: any authenticated role (student, faculty, librarian) can view/read
 * - restricted: reserved for future access-control rules (Phase 3 DRM-lite)
 */
export const BOOK_VISIBILITY = {
  PUBLIC: 'public',
  RESTRICTED: 'restricted',
};

export const BOOK_VISIBILITY_VALUES = Object.values(BOOK_VISIBILITY);
