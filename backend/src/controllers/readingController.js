import * as readingService from "../services/readingService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProgress = asyncHandler(async (req, res) => {
  const progress = await readingService.getProgress(
    req.user._id,
    req.params.bookId,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Reading progress fetched successfully", progress));
});

export const upsertProgress = asyncHandler(async (req, res) => {
  const progress = await readingService.upsertProgress(
    req.user._id,
    req.params.bookId,
    req.body,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Reading progress saved successfully", progress));
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await readingService.getBookmarks(
    req.user._id,
    req.params.bookId,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Bookmarks fetched successfully", bookmarks));
});

export const addBookmark = asyncHandler(async (req, res) => {
  const bookmark = await readingService.addBookmark(
    req.user._id,
    req.params.bookId,
    req.body,
  );
  res.status(201).json(new ApiResponse(201, "Bookmark added successfully", bookmark));
});

export const deleteBookmark = asyncHandler(async (req, res) => {
  await readingService.deleteBookmark(req.user._id, req.params.bookmarkId);
  res.status(200).json(new ApiResponse(200, "Bookmark deleted successfully", null));
});
