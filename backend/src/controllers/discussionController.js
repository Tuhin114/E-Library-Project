import * as discussionService from "../services/discussionService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBookDiscussions = asyncHandler(async (req, res) => {
  const result = await discussionService.listDiscussionsForBook(req.params.id, req.query);
  res.status(200).json(new ApiResponse(200, "Discussions fetched successfully", result));
});

export const createDiscussion = asyncHandler(async (req, res) => {
  const discussion = await discussionService.createDiscussion(
    req.params.id,
    req.user._id,
    req.body,
  );
  res.status(201).json(new ApiResponse(201, "Discussion posted successfully", discussion));
});

export const createReply = asyncHandler(async (req, res) => {
  const reply = await discussionService.createReply(req.params.id, req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, "Reply posted successfully", reply));
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
  await discussionService.deleteDiscussion(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Discussion deleted successfully", null));
});

export const deleteReply = asyncHandler(async (req, res) => {
  await discussionService.deleteReply(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Reply deleted successfully", null));
});
