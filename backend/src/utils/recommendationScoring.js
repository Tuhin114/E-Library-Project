// Favorites are a much stronger signal of taste than "opened it once".
export const FAVORITE_SIGNAL_WEIGHT = 3;
export const RECENTLY_VIEWED_SIGNAL_WEIGHT = 1;

// A shared category/author says more about taste than a shared tag —
// tags are noisier and more numerous per book.
const TAG_MATCH_MULTIPLIER = 0.5;

const idOf = (value) => value?._id?.toString() || value?.toString();

/**
 * Turns a list of { book, weight } signals (favorites, recently-viewed)
 * into an affinity profile: how much this user seems to like each
 * category/author/tag, based on what they've already engaged with.
 */
export const buildAffinity = (signals) => {
  const categoryWeights = new Map();
  const authorWeights = new Map();
  const tagWeights = new Map();

  signals.forEach(({ book, weight }) => {
    if (!book) return;

    const categoryId = idOf(book.category);
    if (categoryId) {
      categoryWeights.set(categoryId, (categoryWeights.get(categoryId) || 0) + weight);
    }

    (book.authors || []).forEach((author) => {
      const authorId = idOf(author);
      if (authorId) {
        authorWeights.set(authorId, (authorWeights.get(authorId) || 0) + weight);
      }
    });

    (book.tags || []).forEach((tag) => {
      tagWeights.set(tag, (tagWeights.get(tag) || 0) + weight);
    });
  });

  return { categoryWeights, authorWeights, tagWeights };
};

/**
 * Scores one candidate book against an affinity profile. Higher means
 * a closer match to what the user already favorited/viewed. A score of
 * 0 means no overlap at all — the caller filters those out rather than
 * recommending something with zero relation to the user's history.
 */
export const scoreCandidate = (candidate, affinity) => {
  let score = 0;

  const categoryId = idOf(candidate.category);
  if (categoryId && affinity.categoryWeights.has(categoryId)) {
    score += affinity.categoryWeights.get(categoryId);
  }

  (candidate.authors || []).forEach((author) => {
    const authorId = idOf(author);
    if (authorId && affinity.authorWeights.has(authorId)) {
      score += affinity.authorWeights.get(authorId);
    }
  });

  (candidate.tags || []).forEach((tag) => {
    if (affinity.tagWeights.has(tag)) {
      score += affinity.tagWeights.get(tag) * TAG_MATCH_MULTIPLIER;
    }
  });

  return score;
};

/**
 * Picks a single human-readable reason for why a candidate was
 * recommended — category match beats author match beats tag match,
 * since that's roughly their signal strength order too.
 */
export const explainRecommendation = (candidate, affinity) => {
  const categoryId = idOf(candidate.category);
  if (categoryId && affinity.categoryWeights.has(categoryId) && candidate.category?.name) {
    return `Because you liked books in ${candidate.category.name}`;
  }

  const matchedAuthor = (candidate.authors || []).find((author) =>
    affinity.authorWeights.has(idOf(author)),
  );
  if (matchedAuthor?.name) {
    return `Because you've read ${matchedAuthor.name}`;
  }

  const matchedTag = (candidate.tags || []).find((tag) => affinity.tagWeights.has(tag));
  if (matchedTag) {
    return `Similar to books tagged "${matchedTag}"`;
  }

  return "Popular with other readers";
};
