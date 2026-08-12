import * as categoryService from "../services/categoryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user._id);
  res
    .status(201)
    .json(new ApiResponse(201, "Category created successfully", category));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  res
    .status(200)
    .json(new ApiResponse(200, "Categories fetched successfully", categories));
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Category fetched successfully", category));
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  res
    .status(200)
    .json(new ApiResponse(200, "Category fetched successfully", category));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Category updated successfully", category));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Category deleted successfully", null));
});
