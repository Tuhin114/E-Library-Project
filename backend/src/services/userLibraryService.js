import Favorite from "../models/Favorite.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import Book from "../models/Book.js";
import { ApiError } from "../utils/ApiError.js";
import { serializeBook } from "../utils/sanitizeBook.js";

const BOOK_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "authors", select: "name slug" },
  { path: "publisher", select: "name slug" },
];

const MAX_RECENTLY_VIEWED = 20;

export const addFavorite = async (userId, bookId) => {
  const bookExists = await Book.exists({ _id: bookId });
  if (!bookExists) throw new ApiError(404, "Book not found");

  try {
    await Favorite.create({ user: userId, book: bookId });
  } catch (error) {
    // Duplicate key — the unique (user, book) index caught a re-favorite,
    // most likely a double-click race. Surface it as a normal 409 rather
    // than a raw Mongo error.
    if (error.code === 11000) {
      throw new ApiError(409, "Book is already in your favorites");
    }
    throw error;
  }
};

export const removeFavorite = async (userId, bookId) => {
  const result = await Favorite.findOneAndDelete({
    user: userId,
    book: bookId,
  });
  if (!result) throw new ApiError(404, "This book is not in your favorites");
};

export const getFavorites = async (userId) => {
  const favorites = await Favorite.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "book", populate: BOOK_POPULATE })
    .lean();

  // .filter(Boolean) guards against a book that was deleted after being
  // favorited — deleteBook() also cleans up Favorite rows directly, but
  // this is a cheap second line of defense against a null populate result.
  return favorites
    .map((favorite) => favorite.book)
    .filter(Boolean)
    .map(serializeBook);
};

/**
 * Upserts a "viewed" entry (bumping `viewedAt` if one already exists rather
 * than creating a duplicate), then trims the user's history down to the
 * most recent MAX_RECENTLY_VIEWED entries. Called fire-and-forget from
 * bookController.getBookById — a failure here should never block or fail
 * the book detail response itself.
 */
export const recordRecentlyViewed = async (userId, bookId) => {
  await RecentlyViewed.findOneAndUpdate(
    { user: userId, book: bookId },
    { $set: { viewedAt: new Date() } },
    { upsert: true, new: true },
  );

  const excess = await RecentlyViewed.find({ user: userId })
    .sort({ viewedAt: -1 })
    .skip(MAX_RECENTLY_VIEWED)
    .select("_id");

  if (excess.length > 0) {
    await RecentlyViewed.deleteMany({
      _id: { $in: excess.map((entry) => entry._id) },
    });
  }
};

export const getRecentlyViewed = async (userId) => {
  const entries = await RecentlyViewed.find({ user: userId })
    .sort({ viewedAt: -1 })
    .limit(MAX_RECENTLY_VIEWED)
    .populate({ path: "book", populate: BOOK_POPULATE })
    .lean();

  return entries
    .map((entry) => entry.book)
    .filter(Boolean)
    .map(serializeBook);
};
