import mongoose from "mongoose";
import Review from "../models/Review.js";
import Book from "../models/Book.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";

const REVIEW_POPULATE = { path: "user", select: "name avatar" };

/**
 * Recomputes and persists Book.avgRating/reviewCount from the Review
 * collection. Called after every create/update/delete so the
 * denormalized fields on Book never drift from the source of truth.
 */
const recalculateBookRating = async (bookId) => {
  const [result] = await Review.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    { $group: { _id: "$book", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Book.findByIdAndUpdate(bookId, {
    avgRating: result ? Math.round(result.avgRating * 10) / 10 : 0,
    reviewCount: result ? result.count : 0,
  });
};

export const listReviewsForBook = async (bookId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [reviews, totalItems] = await Promise.all([
    Review.find({ book: bookId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(REVIEW_POPULATE)
      .lean(),
    Review.countDocuments({ book: bookId }),
  ]);

  return { reviews, pagination: buildPaginationMeta({ page, limit, totalItems }) };
};

export const createReview = async (bookId, userId, { rating, comment }) => {
  const book = await Book.exists({ _id: bookId });
  if (!book) throw new ApiError(404, "Book not found");

  const alreadyReviewed = await Review.exists({ book: bookId, user: userId });
  if (alreadyReviewed) {
    throw new ApiError(
      409,
      "You have already reviewed this book. Edit your existing review instead.",
    );
  }

  const review = await Review.create({ book: bookId, user: userId, rating, comment });
  await recalculateBookRating(bookId);

  return review.populate(REVIEW_POPULATE);
};

// Ownership-scoped — the query itself excludes anyone else's review,
// same pattern as SavedSearch deletion.
export const updateReview = async (reviewId, userId, { rating, comment }) => {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) throw new ApiError(404, "Review not found");

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  await review.save();
  await recalculateBookRating(review.book);

  return review.populate(REVIEW_POPULATE);
};

// Owner can delete their own review; librarian can delete any review
// (moderation) — the one place this differs from the pure
// ownership-scoped pattern above.
export const deleteReview = async (reviewId, requestingUser) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  const isOwner = review.user.toString() === requestingUser._id.toString();
  if (!isOwner && requestingUser.role !== ROLES.LIBRARIAN) {
    throw new ApiError(403, "You are not authorized to delete this review");
  }

  const { book } = review;
  await review.deleteOne();
  await recalculateBookRating(book);
};
