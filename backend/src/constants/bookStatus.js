/**
 * Lifecycle status of a Book record.
 * - draft: created but not yet visible in public catalog listings
 * - published: visible in catalog listings and search results
 * - archived: hidden from catalog listings, retained for record-keeping
 */
export const BOOK_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const BOOK_STATUS_VALUES = Object.values(BOOK_STATUS);
