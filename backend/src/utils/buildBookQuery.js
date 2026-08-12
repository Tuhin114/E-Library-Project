/**
 * Builds the exact-match filter object from simple, indexed query params.
 * Free-text `search` is intentionally NOT handled here — it needs to also
 * resolve matching Author/Category/Publisher names, which requires small
 * lookup queries against those collections. That orchestration lives in
 * bookService.listBooks() so this file stays a pure, dependency-free
 * builder (easy to unit test in isolation).
 */
export const buildBookExactFilters = (query) => {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.author) filter.authors = query.author;
  if (query.publisher) filter.publisher = query.publisher;
  if (query.language) filter.language = query.language;
  if (query.status) filter.status = query.status;
  if (query.visibility) filter.visibility = query.visibility;

  if (query.tags) {
    const tags = Array.isArray(query.tags)
      ? query.tags
      : query.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
    if (tags.length > 0) filter.tags = { $in: tags };
  }

  return filter;
};

/**
 * Escapes user input before building a RegExp from it, so search text
 * containing regex metacharacters (e.g. "C++", "3.14") can't break the
 * pattern or (in pathological cases) cause catastrophic backtracking.
 */
export const buildBookSearchRegex = (search) => {
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "i");
};

export const BOOK_SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title_asc: { title: 1 },
  title_desc: { title: -1 },
  year_desc: { publicationYear: -1 },
  year_asc: { publicationYear: 1 },
};

export const buildBookSort = (sortKey) =>
  BOOK_SORT_OPTIONS[sortKey] || BOOK_SORT_OPTIONS.newest;
