/**
 * Fixed set of forum categories. Deliberately not a DB-backed model —
 * a hardcoded enum gives real structure to the thread list without
 * building a category-CRUD admin surface for something that doesn't
 * need to change often. Revisit as a managed model only if that
 * changes.
 */
export const FORUM_CATEGORIES = Object.freeze({
  GENERAL: "general",
  RECOMMENDATIONS: "recommendations",
  AUTHOR_DISCUSSIONS: "author-discussions",
  OFF_TOPIC: "off-topic",
});

export const FORUM_CATEGORY_VALUES = Object.values(FORUM_CATEGORIES);
