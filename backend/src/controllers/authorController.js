import * as authorService from "../services/authorService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAuthor = asyncHandler(async (req, res) => {
  const author = await authorService.createAuthor(req.body, req.user._id);
  res
    .status(201)
    .json(new ApiResponse(201, "Author created successfully", author));
});

export const getAuthors = asyncHandler(async (req, res) => {
  const authors = await authorService.getAuthors();
  res
    .status(200)
    .json(new ApiResponse(200, "Authors fetched successfully", authors));
});

export const getAuthorById = asyncHandler(async (req, res) => {
  const author = await authorService.getAuthorById(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Author fetched successfully", author));
});

export const getAuthorBySlug = asyncHandler(async (req, res) => {
  const author = await authorService.getAuthorBySlug(req.params.slug);
  res
    .status(200)
    .json(new ApiResponse(200, "Author fetched successfully", author));
});

export const updateAuthor = asyncHandler(async (req, res) => {
  const author = await authorService.updateAuthor(req.params.id, req.body);
  res
    .status(200)
    .json(new ApiResponse(200, "Author updated successfully", author));
});

export const deleteAuthor = asyncHandler(async (req, res) => {
  await authorService.deleteAuthor(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Author deleted successfully", null));
});
