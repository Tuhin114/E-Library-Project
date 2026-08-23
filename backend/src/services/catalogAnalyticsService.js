import Book from "../models/Book.js";
import Favorite from "../models/Favorite.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import Discussion from "../models/Discussion.js";
import { serializeBook } from "../utils/sanitizeBook.js";
import { BOOK_STATUS } from "../constants/bookStatus.js";

const BOOK_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "authors", select: "name slug" },
  { path: "publisher", select: "name slug" },
];

const DEFAULT_TOP_N = 10;

// Scope note (flagged in M2_CHANGES.md, not just here): every list below
// is scoped to `status: published` — the same restriction Phase 3 M1
// already enforces for non-librarians on the catalog itself. A librarian
// viewing analytics wants "what's happening in the live catalog," not
// noise from drafts nobody but them can even see yet. If you want a
// draft/archived breakdown too, that's an additive query, not a rework
// of this one.
const PUBLISHED = { status: BOOK_STATUS.PUBLISHED };

/**
 * Resolves a list of { _id: bookId, count } aggregation results into
 * full serialized books, in the same order, with `count` attached as
 * `metricValue` under `metricLabel`. Shared by every "top N books by
 * some count" section below so the response shape is identical across
 * mostFavorited/mostViewed/mostDiscussed.
 */
const hydrateBookCounts = async (counted, metricLabel) => {
  if (counted.length === 0) return [];

  const books = await Book.find({
    _id: { $in: counted.map((entry) => entry._id) },
    ...PUBLISHED,
  })
    .populate(BOOK_POPULATE)
    .lean();

  const byId = new Map(books.map((book) => [book._id.toString(), book]));

  return counted
    .map((entry) => {
      const book = byId.get(entry._id.toString());
      if (!book) return null; // book since unpublished/deleted — drop, don't crash
      return {
        ...serializeBook(book),
        metricLabel,
        metricValue: entry.count,
      };
    })
    .filter(Boolean);
};

const getMostFavorited = async (limit) => {
  const counted = await Favorite.aggregate([
    { $group: { _id: "$book", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return hydrateBookCounts(counted, "favorites");
};

// RecentlyViewed has a unique (user, book) index — one row per user per
// book, updated in place on repeat views rather than duplicated. So a
// count of rows for a book IS a count of distinct viewers, not raw page
// loads. That's the honest framing for the UI: "viewed by N readers,"
// not "viewed N times."
const getMostViewed = async (limit) => {
  const counted = await RecentlyViewed.aggregate([
    { $group: { _id: "$book", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return hydrateBookCounts(counted, "viewers");
};

const getMostDiscussed = async (limit) => {
  const counted = await Discussion.aggregate([
    { $group: { _id: "$book", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return hydrateBookCounts(counted, "discussion posts");
};

// No aggregate needed — avgRating/reviewCount are already denormalized
// on Book (Phase 4 M2), recomputed on every review create/edit/delete.
// This is a plain find+sort, same cost as any other catalog sort.
const getTopRated = async (limit) => {
  const books = await Book.find({ ...PUBLISHED, reviewCount: { $gt: 0 } })
    .sort({ avgRating: -1, reviewCount: -1 })
    .limit(limit)
    .populate(BOOK_POPULATE)
    .lean();

  return books.map((book) => ({
    ...serializeBook(book),
    metricLabel: "rating",
    metricValue: book.avgRating,
  }));
};

const getCategoryDistribution = async () => {
  const rows = await Book.aggregate([
    { $match: PUBLISHED },
    { $group: { _id: "$category", bookCount: { $sum: 1 } } },
    { $sort: { bookCount: -1 } },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $project: {
        _id: 0,
        category: { _id: "$category._id", name: "$category.name", slug: "$category.slug" },
        bookCount: 1,
      },
    },
  ]);
  return rows;
};

const getAuthorDistribution = async (limit) => {
  const rows = await Book.aggregate([
    { $match: PUBLISHED },
    { $unwind: "$authors" },
    { $group: { _id: "$authors", bookCount: { $sum: 1 } } },
    { $sort: { bookCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "authors",
        localField: "_id",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $project: {
        _id: 0,
        author: { _id: "$author._id", name: "$author.name", slug: "$author.slug" },
        bookCount: 1,
      },
    },
  ]);
  return rows;
};

// "Dead stock" — published (so actually visible to readers) but with
// zero recorded interaction across every engagement signal the app
// has. A single aggregation with four $lookups rather than four round
// trips and a set-difference in application code.
const getDeadStock = async (limit) => {
  const rows = await Book.aggregate([
    { $match: PUBLISHED },
    {
      $lookup: {
        from: "favorites",
        localField: "_id",
        foreignField: "book",
        as: "favorites",
      },
    },
    {
      $lookup: {
        from: "recentlyvieweds",
        localField: "_id",
        foreignField: "book",
        as: "views",
      },
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "book",
        as: "reviews",
      },
    },
    {
      $lookup: {
        from: "discussions",
        localField: "_id",
        foreignField: "book",
        as: "discussions",
      },
    },
    {
      $match: {
        favorites: { $size: 0 },
        views: { $size: 0 },
        reviews: { $size: 0 },
        discussions: { $size: 0 },
      },
    },
    { $sort: { createdAt: 1 } }, // longest-published-with-no-interaction first
    { $limit: limit },
    {
      $project: {
        favorites: 0,
        views: 0,
        reviews: 0,
        discussions: 0,
      },
    },
  ]);

  return rows.map((book) => serializeBook(book));
};

export const getCatalogAnalytics = async ({ limit = DEFAULT_TOP_N } = {}) => {
  const [
    mostFavorited,
    mostViewed,
    mostDiscussed,
    topRated,
    categoryDistribution,
    authorDistribution,
    deadStock,
    totalPublished,
  ] = await Promise.all([
    getMostFavorited(limit),
    getMostViewed(limit),
    getMostDiscussed(limit),
    getTopRated(limit),
    getCategoryDistribution(),
    getAuthorDistribution(limit),
    getDeadStock(limit),
    Book.countDocuments(PUBLISHED),
  ]);

  return {
    totalPublished,
    mostFavorited,
    mostViewed,
    mostDiscussed,
    topRated,
    categoryDistribution,
    authorDistribution,
    deadStock: {
      count: deadStock.length, // count of the capped list, not a true total — see M2_CHANGES.md
      books: deadStock,
    },
  };
};
