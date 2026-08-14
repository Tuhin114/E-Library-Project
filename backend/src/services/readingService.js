import Bookmark from "../models/Bookmark.js";
import ReadingProgress from "../models/ReadingProgress.js";
import Book from "../models/Book.js";
import { ApiError } from "../utils/ApiError.js";
import { serializeBook } from "../utils/sanitizeBook.js";

const BOOK_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "authors", select: "name slug" },
  { path: "publisher", select: "name slug" },
];

const CONTINUE_READING_LIMIT = 10;

const assertBookExists = async (bookId) => {
  const exists = await Book.exists({ _id: bookId });
  if (!exists) throw new ApiError(404, "Book not found");
};

export const getProgress = async (userId, bookId) => {
  const progress = await ReadingProgress.findOne({
    user: userId,
    book: bookId,
  }).lean();

  return progress || null;
};

export const upsertProgress = async (
  userId,
  bookId,
  { format, location, percentComplete },
) => {
  await assertBookExists(bookId);

  return ReadingProgress.findOneAndUpdate(
    { user: userId, book: bookId },
    {
      $set: {
        format,
        location,
        percentComplete: percentComplete ?? 0,
        lastReadAt: new Date(),
      },
    },
    { upsert: true, new: true },
  ).lean();
};

// Books the user has started but not finished, most recently read
// first. Excludes fully-read books the same way a video app hides
// finished episodes from "Continue Watching".
export const getContinueReading = async (userId) => {
  const entries = await ReadingProgress.find({
    user: userId,
    percentComplete: { $lt: 100 },
  })
    .sort({ lastReadAt: -1 })
    .limit(CONTINUE_READING_LIMIT)
    .populate({ path: "book", populate: BOOK_POPULATE })
    .lean();

  return entries
    .filter((entry) => entry.book)
    .map((entry) => ({
      ...serializeBook(entry.book),
      readingProgress: {
        format: entry.format,
        location: entry.location,
        percentComplete: entry.percentComplete,
        lastReadAt: entry.lastReadAt,
      },
    }));
};

export const addBookmark = async (userId, bookId, { format, location, label }) => {
  await assertBookExists(bookId);

  const bookmark = await Bookmark.create({
    user: userId,
    book: bookId,
    format,
    location,
    label,
  });

  return bookmark.toObject();
};

export const getBookmarks = async (userId, bookId) =>
  Bookmark.find({ user: userId, book: bookId }).sort({ createdAt: -1 }).lean();

export const deleteBookmark = async (userId, bookmarkId) => {
  const result = await Bookmark.findOneAndDelete({
    _id: bookmarkId,
    user: userId,
  });
  if (!result) throw new ApiError(404, "Bookmark not found");
};
