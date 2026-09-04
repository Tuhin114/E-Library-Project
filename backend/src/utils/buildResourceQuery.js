export const buildResourceExactFilters = (query) => {
  const filter = {};

  if (query.resourceType) filter.resourceType = query.resourceType;
  if (query.subject) filter.subject = query.subject;

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

// Escapes user input before building a RegExp from it, same
// precaution buildBookQuery.js takes.
export const buildResourceSearchRegex = (search) => {
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "i");
};

export const RESOURCE_SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title_asc: { title: 1 },
  title_desc: { title: -1 },
};

export const buildResourceSort = (sortKey) =>
  RESOURCE_SORT_OPTIONS[sortKey] || RESOURCE_SORT_OPTIONS.newest;
