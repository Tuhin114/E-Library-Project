import * as reviewService from "../services/reviewService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBookReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.listReviewsForBook(req.params.id, req.query);
  res.status(200).json(new ApiResponse(200, "Reviews fetched successfully", result));
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.params.id, req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, "Review submitted successfully", review));
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.params.id, req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, "Review updated successfully", review));
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Review deleted successfully", null));
});
