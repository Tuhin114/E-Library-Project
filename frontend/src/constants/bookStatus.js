export const BOOK_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const BOOK_STATUS_VALUES = Object.values(BOOK_STATUS);

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.DRAFT]: 'Draft',
  [BOOK_STATUS.PUBLISHED]: 'Published',
  [BOOK_STATUS.ARCHIVED]: 'Archived',
};
