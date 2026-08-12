import * as bookService from "../services/bookService.js";
import * as userLibraryService from "../services/userLibraryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBook = asyncHandler(async (req, res) => {
  const book = await bookService.createBook(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, "Book created successfully", book));
});

export const getBooks = asyncHandler(async (req, res) => {
  const result = await bookService.listBooks(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Books fetched successfully", result));
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);

  // Fire-and-forget: recording a view is a side effect of reading a book,
  // not part of what the caller is waiting on. Logged, not thrown, so a
  // transient DB hiccup here can never turn a successful book fetch into
  // an error response.
  userLibraryService
    .recordRecentlyViewed(req.user._id, req.params.id)
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to record recently viewed entry:", error.message);
    });

  res.status(200).json(new ApiResponse(200, "Book fetched successfully", book));
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, "Book updated successfully", book));
});

export const deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req.params.id);
  res.status(200).json(new ApiResponse(200, "Book deleted successfully", null));
});

export const uploadCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file provided");
  const book = await bookService.uploadCoverImage(req.params.id, req.file);
  res
    .status(200)
    .json(new ApiResponse(200, "Cover image uploaded successfully", book));
});

export const deleteCoverImage = asyncHandler(async (req, res) => {
  const book = await bookService.deleteCoverImage(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Cover image deleted successfully", book));
});

export const uploadDigitalFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file provided");
  const book = await bookService.uploadDigitalFile(
    req.params.id,
    req.params.type,
    req.file,
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${req.params.type.toUpperCase()} uploaded successfully`,
        book,
      ),
    );
});

export const deleteDigitalFile = asyncHandler(async (req, res) => {
  const book = await bookService.deleteDigitalFile(
    req.params.id,
    req.params.type,
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${req.params.type.toUpperCase()} deleted successfully`,
        book,
      ),
    );
});
