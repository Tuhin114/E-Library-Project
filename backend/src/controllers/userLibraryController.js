import * as userLibraryService from "../services/userLibraryService.js";
import * as readingService from "../services/readingService.js";
import * as recommendationService from "../services/recommendationService.js";
import * as activityService from "../services/activityService.js";
import * as physicalRequestService from "../services/physicalRequestService.js";
import * as loanService from "../services/loanService.js";
import * as feeService from "../services/feeService.js";
import * as waitlistService from "../services/waitlistService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addFavorite = asyncHandler(async (req, res) => {
  await userLibraryService.addFavorite(req.user._id, req.params.bookId);
  res.status(201).json(new ApiResponse(201, "Book added to favorites", null));
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await userLibraryService.removeFavorite(req.user._id, req.params.bookId);
  res
    .status(200)
    .json(new ApiResponse(200, "Book removed from favorites", null));
});

export const getFavorites = asyncHandler(async (req, res) => {
  const books = await userLibraryService.getFavorites(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, "Favorites fetched successfully", books));
});

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const books = await userLibraryService.getRecentlyViewed(req.user._id);
  res
    .status(200)
    .json(
      new ApiResponse(200, "Recently viewed books fetched successfully", books),
    );
});

// Delegates to readingService — it owns the ReadingProgress model this
// query reads from — but stays exposed at /me/continue-reading, next
// to favorites and recently-viewed, since that's the same "my library"
// concern from the client's point of view.
export const getContinueReading = asyncHandler(async (req, res) => {
  const books = await readingService.getContinueReading(req.user._id);
  res
    .status(200)
    .json(
      new ApiResponse(200, "Continue reading list fetched successfully", books),
    );
});

// Same delegation pattern as getContinueReading above — the scoring
// logic lives in recommendationService.js, this just exposes it under
// the "my library" route group.
export const getRecommendations = asyncHandler(async (req, res) => {
  const books = await recommendationService.getRecommendations(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, "Recommendations fetched successfully", books));
});

// Same delegation pattern as getContinueReading/getRecommendations above —
// activityService owns the cross-collection aggregation, this just
// exposes it under the "my library" route group as the single endpoint
// the Activity Dashboard page loads on mount.
export const getActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.getActivitySummary(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, "Activity summary fetched successfully", activity));
});

// Same delegation pattern as the above — physicalRequestService owns
// the PhysicalRequest model (Phase 6), this just exposes "my own
// requests" under the "my library" route group, same as every other
// self-scoped list here.
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await physicalRequestService.listRequestsForStudent(req.user._id, req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Requests fetched successfully", requests));
});

// M3 — same delegation pattern, this time for the student's own loans.
export const getMyLoans = asyncHandler(async (req, res) => {
  const loans = await loanService.listLoansForStudent(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, "Loans fetched successfully", loans));
});

// M4 — same delegation pattern, this time for the student's own fees.
export const getMyFees = asyncHandler(async (req, res) => {
  const fees = await feeService.listFeesForStudent(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, "Fees fetched successfully", fees));
});

// M2 (Phase 7) — same delegation pattern, this time for the student's
// own waitlist entries across every book.
export const getMyWaitlist = asyncHandler(async (req, res) => {
  const entries = await waitlistService.listForUser(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, "Your waitlist entries fetched successfully", entries));
});
