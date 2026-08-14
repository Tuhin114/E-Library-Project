import mongoose from "mongoose";
import Book from "../models/Book.js";
import Favorite from "../models/Favorite.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import { serializeBook } from "../utils/sanitizeBook.js";
import { BOOK_STATUS } from "../constants/bookStatus.js";
import {
  buildAffinity,
  scoreCandidate,
  explainRecommendation,
  FAVORITE_SIGNAL_WEIGHT,
  RECENTLY_VIEWED_SIGNAL_WEIGHT,
} from "../utils/recommendationScoring.js";

const BOOK_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "authors", select: "name slug" },
  { path: "publisher", select: "name slug" },
];

const DEFAULT_LIMIT = 10;

// Bounds how many published books get scored per request. Fine for a
// library-scale catalog; would need real pagination/indexing for a
// much larger one, but that's out of scope for a rule-based v1.
const CANDIDATE_POOL_SIZE = 300;

const buildSignals = (favoriteBooks, recentlyViewedBooks) => [
  ...favoriteBooks.map((book) => ({ book, weight: FAVORITE_SIGNAL_WEIGHT })),
  ...recentlyViewedBooks.map((book) => ({ book, weight: RECENTLY_VIEWED_SIGNAL_WEIGHT })),
];

// Most-favorited published books, used both for cold-start users (no
// signals to personalize from yet) and to top up a sparse personalized
// list rather than returning fewer than `limit` results.
const getPopularFallback = async (limit, excludeIds) => {
  if (limit <= 0) return [];

  const excludeObjectIds = excludeIds.map((id) => new mongoose.Types.ObjectId(id));

  const popular = await Favorite.aggregate([
    { $match: { book: { $nin: excludeObjectIds } } },
    { $group: { _id: "$book", favoriteCount: { $sum: 1 } } },
    { $sort: { favoriteCount: -1 } },
    { $limit: limit * 2 },
  ]);

  if (popular.length === 0) return [];

  const books = await Book.find({
    _id: { $in: popular.map((entry) => entry._id) },
    status: BOOK_STATUS.PUBLISHED,
  })
    .populate(BOOK_POPULATE)
    .lean();

  const byId = new Map(books.map((book) => [book._id.toString(), book]));

  return popular
    .map((entry) => byId.get(entry._id.toString()))
    .filter(Boolean)
    .slice(0, limit)
    .map((book) => ({
      ...serializeBook(book),
      recommendationReason: "Popular with other readers",
    }));
};

export const getRecommendations = async (userId, { limit = DEFAULT_LIMIT } = {}) => {
  const [favoriteEntries, recentlyViewedEntries] = await Promise.all([
    Favorite.find({ user: userId })
      .populate({ path: "book", populate: BOOK_POPULATE })
      .lean(),
    RecentlyViewed.find({ user: userId })
      .populate({ path: "book", populate: BOOK_POPULATE })
      .lean(),
  ]);

  const favoriteBooks = favoriteEntries.map((entry) => entry.book).filter(Boolean);
  const recentlyViewedBooks = recentlyViewedEntries
    .map((entry) => entry.book)
    .filter(Boolean);

  const excludeIds = [
    ...new Set([
      ...favoriteBooks.map((book) => book._id.toString()),
      ...recentlyViewedBooks.map((book) => book._id.toString()),
    ]),
  ];

  const signals = buildSignals(favoriteBooks, recentlyViewedBooks);

  // Cold start — nothing favorited or viewed yet, so there's no basis
  // for a personalized score. Fall back to what's popular overall.
  if (signals.length === 0) {
    return getPopularFallback(limit, excludeIds);
  }

  const affinity = buildAffinity(signals);

  const candidates = await Book.find({
    status: BOOK_STATUS.PUBLISHED,
    _id: { $nin: excludeIds },
  })
    .populate(BOOK_POPULATE)
    .limit(CANDIDATE_POOL_SIZE)
    .lean();

  const recommendations = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, affinity) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => ({
      ...serializeBook(candidate),
      recommendationReason: explainRecommendation(candidate, affinity),
    }));

  // Not enough personalized matches to fill a full row — top up with
  // popular books rather than returning a sparse list.
  if (recommendations.length < limit) {
    const alreadyChosenIds = [
      ...excludeIds,
      ...recommendations.map((book) => book._id.toString()),
    ];
    const fallback = await getPopularFallback(
      limit - recommendations.length,
      alreadyChosenIds,
    );
    return [...recommendations, ...fallback];
  }

  return recommendations;
};
