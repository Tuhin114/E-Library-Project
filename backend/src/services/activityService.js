import Favorite from "../models/Favorite.js";
import ReadingProgress from "../models/ReadingProgress.js";
import Review from "../models/Review.js";
import Resource from "../models/Resource.js";
import { serializeBook } from "../utils/sanitizeBook.js";
import { serializeResource } from "../utils/sanitizeResource.js";
import * as savedListService from "./savedListService.js";

const BOOK_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "authors", select: "name slug" },
  { path: "publisher", select: "name slug" },
];

// This is a summary, not a paginated list — each section shows its most
// recent entries only. "View all" on the dashboard links out to the
// existing dedicated page (Favorites, Continue Reading, Profile) rather
// than this endpoint trying to paginate four different collections at
// once.
const SECTION_LIMIT = 5;

const withReadingProgress = (entry) => ({
  ...serializeBook(entry.book),
  readingProgress: {
    format: entry.format,
    location: entry.location,
    percentComplete: entry.percentComplete,
    lastReadAt: entry.lastReadAt,
  },
});

/**
 * Aggregates the "my activity" data points this dashboard needs —
 * Favorites (Phase 2), Continue Reading + Recently Completed (both
 * derived from ReadingProgress, Phase 3 M4), My Reviews (Phase 4 M2),
 * and, as of Phase 10 M4, My Uploads (Resource) and My Saved Lists —
 * into one response so /me/activity is a single round trip instead of
 * the frontend firing six separate requests on mount.
 *
 * Counts and section entries are fetched in parallel; counts reflect
 * the true total even though each section array is capped at
 * SECTION_LIMIT, so the UI can show "12 favorites" while only
 * rendering 5 cards plus a "view all" link. My Saved Lists is the one
 * exception to "capped at the database layer" — see its own comment
 * below for why.
 */
export const getActivitySummary = async (userId) => {
  const [
    favoritesCount,
    inProgressCount,
    completedCount,
    reviewsCount,
    uploadsCount,
    favoriteEntries,
    inProgressEntries,
    completedEntries,
    reviewEntries,
    uploadEntries,
    allSavedLists,
  ] = await Promise.all([
    Favorite.countDocuments({ user: userId }),
    ReadingProgress.countDocuments({
      user: userId,
      percentComplete: { $lt: 100 },
    }),
    ReadingProgress.countDocuments({ user: userId, percentComplete: 100 }),
    Review.countDocuments({ user: userId }),
    Resource.countDocuments({ uploadedBy: userId }),

    Favorite.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(SECTION_LIMIT)
      .populate({ path: "book", populate: BOOK_POPULATE })
      .lean(),

    ReadingProgress.find({ user: userId, percentComplete: { $lt: 100 } })
      .sort({ lastReadAt: -1 })
      .limit(SECTION_LIMIT)
      .populate({ path: "book", populate: BOOK_POPULATE })
      .lean(),

    // Same shape as Continue Reading, opposite filter — reuses the
    // existing ReadingProgress index on { user, lastReadAt } since only
    // the percentComplete match differs.
    ReadingProgress.find({ user: userId, percentComplete: 100 })
      .sort({ lastReadAt: -1 })
      .limit(SECTION_LIMIT)
      .populate({ path: "book", populate: BOOK_POPULATE })
      .lean(),

    Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(SECTION_LIMIT)
      .populate({ path: "book", select: "title coverImage" })
      .lean(),

    // My Uploads (Phase 10 M4) — the same "capped section + true total
    // count" shape every section above already uses, applied to the
    // resources this user has uploaded (any visibility — this is their
    // own activity view, not a public listing, so private uploads
    // belong here same as public ones).
    Resource.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(SECTION_LIMIT)
      .lean(),

    // My Saved Lists (Phase 10 M4) — deliberately reuses
    // savedListService.listSavedLists rather than re-deriving the
    // itemCount aggregation here a second time. That function has no
    // limit param of its own (Saved Lists are expected to be few per
    // user, unlike Favorites/reviews), so capping to SECTION_LIMIT
    // happens after the call below instead of at the query layer —
    // the one section in this file that isn't capped at the database
    // layer, flagged here rather than silently inconsistent with the
    // others.
    savedListService.listSavedLists({ _id: userId }),
  ]);

  // .filter(Boolean) guards the same way userLibraryService.getFavorites
  // does — a populate can resolve to null if the referenced book was
  // deleted (cascade cleanup runs elsewhere, this is the cheap second
  // line of defense).
  const favorites = favoriteEntries
    .filter((entry) => entry.book)
    .map((entry) => serializeBook(entry.book));

  const continueReading = inProgressEntries
    .filter((entry) => entry.book)
    .map(withReadingProgress);

  const recentlyCompleted = completedEntries
    .filter((entry) => entry.book)
    .map(withReadingProgress);

  const myReviews = reviewEntries
    .filter((review) => review.book)
    .map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      book: {
        _id: review.book._id,
        title: review.book.title,
        coverImage: review.book.coverImage,
      },
    }));

  const myUploads = uploadEntries.map(serializeResource);

  const mySavedLists = allSavedLists.slice(0, SECTION_LIMIT);

  return {
    stats: {
      favoritesCount,
      inProgressCount,
      completedCount,
      reviewsCount,
      uploadsCount,
      savedListsCount: allSavedLists.length,
    },
    favorites,
    continueReading,
    recentlyCompleted,
    myReviews,
    myUploads,
    mySavedLists,
  };
};
