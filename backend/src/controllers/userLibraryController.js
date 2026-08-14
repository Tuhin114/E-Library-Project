import * as userLibraryService from "../services/userLibraryService.js";
import * as readingService from "../services/readingService.js";
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
