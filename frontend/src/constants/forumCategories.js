/**
 * Mirrors backend/src/constants/forumCategories.js. Fixed set,
 * deliberately not editable by librarians — see the backend file's
 * comment for why.
 */
export const FORUM_CATEGORIES = Object.freeze({
  GENERAL: "general",
  RECOMMENDATIONS: "recommendations",
  AUTHOR_DISCUSSIONS: "author-discussions",
  OFF_TOPIC: "off-topic",
});

export const FORUM_CATEGORY_OPTIONS = [
  { value: FORUM_CATEGORIES.GENERAL, label: "General Discussion" },
  { value: FORUM_CATEGORIES.RECOMMENDATIONS, label: "Book Recommendations" },
  { value: FORUM_CATEGORIES.AUTHOR_DISCUSSIONS, label: "Author Discussions" },
  { value: FORUM_CATEGORIES.OFF_TOPIC, label: "Off Topic" },
];

export const FORUM_CATEGORY_LABELS = Object.freeze(
  Object.fromEntries(FORUM_CATEGORY_OPTIONS.map((option) => [option.value, option.label])),
);

export const FORUM_SORT_OPTIONS = [
  { value: "latest", label: "Latest Activity" },
  { value: "most_replies", label: "Most Replies" },
  { value: "unanswered", label: "Unanswered" },
];
