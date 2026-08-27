import mongoose from "mongoose";
import Book from "../models/Book.js";
import BookCopy from "../models/BookCopy.js";
import { ApiError } from "../utils/ApiError.js";
import { COPY_STATUS, COPY_STATUS_VALUES } from "../constants/copyStatus.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertBookExists = async (bookId) => {
  const book = await Book.findById(bookId).select("isbn").lean();
  if (!book) throw new ApiError(404, "Book not found");
  return book;
};

// Recomputes and persists Book.physicalCopiesTotal/physicalCopiesAvailable
// from the BookCopy collection, the same pattern reviewService uses to
// keep Book.avgRating/reviewCount from drifting out of sync. "Total"
// excludes retired copies (permanently decommissioned); "available"
// counts only copies currently borrowable.
const recalculateBookCopyCounts = async (bookId) => {
  const [result] = await BookCopy.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    {
      $group: {
        _id: null,
        total: {
          $sum: { $cond: [{ $ne: ["$status", COPY_STATUS.RETIRED] }, 1, 0] },
        },
        available: {
          $sum: { $cond: [{ $eq: ["$status", COPY_STATUS.AVAILABLE] }, 1, 0] },
        },
      },
    },
  ]);

  await Book.findByIdAndUpdate(bookId, {
    physicalCopiesTotal: result ? result.total : 0,
    physicalCopiesAvailable: result ? result.available : 0,
  });
};

// Copy numbers are derived from the book's ISBN (e.g. "978...-003"),
// continuing from the highest existing sequence for that book rather
// than from a plain count — so a deleted copy in the middle of the
// sequence can never cause a newly generated number to collide with
// one that's still in use.
const generateCopyNumbers = async (book, count) => {
  const existing = await BookCopy.find({ book: book._id })
    .select("copyNumber")
    .lean();

  const prefix = `${book.isbn}-`;
  const pattern = new RegExp(`^${escapeRegex(prefix)}(\\d+)$`);

  let maxSeq = 0;
  existing.forEach(({ copyNumber }) => {
    const match = copyNumber.match(pattern);
    if (match) maxSeq = Math.max(maxSeq, parseInt(match[1], 10));
  });

  return Array.from({ length: count }, (_, i) =>
    `${prefix}${String(maxSeq + i + 1).padStart(3, "0")}`,
  );
};

export const addCopies = async (bookId, { count, condition }) => {
  const book = await assertBookExists(bookId);
  const copyNumbers = await generateCopyNumbers(book, count);

  const copies = await BookCopy.insertMany(
    copyNumbers.map((copyNumber) => ({
      book: bookId,
      copyNumber,
      ...(condition && { condition }),
    })),
  );

  await recalculateBookCopyCounts(bookId);

  return copies;
};

export const listCopiesForBook = async (bookId, { status } = {}) => {
  await assertBookExists(bookId);

  const filter = { book: bookId, ...(status && { status }) };
  return BookCopy.find(filter).sort({ copyNumber: 1 }).lean();
};

// M3 — used by loanService.collectRequest when a librarian confirms
// collection without specifying a particular copy: picks the
// lowest-numbered currently-available copy for the book. Deliberately
// not exposed as its own route; it's an internal building block for the
// collection flow, not a librarian-facing query.
export const findAvailableCopyForBook = (bookId) =>
  BookCopy.findOne({ book: bookId, status: COPY_STATUS.AVAILABLE }).sort({
    copyNumber: 1,
  });

export const getInventorySummary = async (bookId) => {
  await assertBookExists(bookId);

  const counts = await BookCopy.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const countByStatus = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  const breakdown = COPY_STATUS_VALUES.reduce((acc, status) => {
    acc[status] = countByStatus[status] || 0;
    return acc;
  }, {});

  const totalCopies = Object.values(breakdown).reduce((sum, n) => sum + n, 0);

  return { bookId, totalCopies, breakdown };
};

export const updateCopy = async (copyId, payload) => {
  const copy = await BookCopy.findById(copyId);
  if (!copy) throw new ApiError(404, "Copy not found");

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) copy[key] = value;
  });

  await copy.save();
  await recalculateBookCopyCounts(copy.book);

  return copy;
};

export const deleteCopy = async (copyId) => {
  const copy = await BookCopy.findById(copyId);
  if (!copy) throw new ApiError(404, "Copy not found");

  if ([COPY_STATUS.ISSUED, COPY_STATUS.RESERVED].includes(copy.status)) {
    throw new ApiError(
      409,
      "Cannot remove a copy that is currently issued or reserved",
    );
  }

  const { book } = copy;
  await copy.deleteOne();
  await recalculateBookCopyCounts(book);
};

// Exported so bookService.deleteBook can cascade — same pattern already
// used for Favorite/RecentlyViewed cleanup when a book is deleted.
export const deleteCopiesForBook = async (bookId) => {
  const activeCopy = await BookCopy.exists({
    book: bookId,
    status: { $in: [COPY_STATUS.ISSUED, COPY_STATUS.RESERVED] },
  });
  if (activeCopy) {
    throw new ApiError(
      409,
      "Cannot delete a book that has copies currently issued or reserved",
    );
  }

  await BookCopy.deleteMany({ book: bookId });
};
