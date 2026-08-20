import * as forumService from "../services/forumService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listThreads = asyncHandler(async (req, res) => {
  const result = await forumService.listThreads(req.query);
  res.status(200).json(new ApiResponse(200, "Threads fetched successfully", result));
});

export const getThread = asyncHandler(async (req, res) => {
  const thread = await forumService.getThreadWithReplies(req.params.id);
  res.status(200).json(new ApiResponse(200, "Thread fetched successfully", thread));
});

export const createThread = asyncHandler(async (req, res) => {
  const thread = await forumService.createThread(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, "Thread posted successfully", thread));
});

export const createReply = asyncHandler(async (req, res) => {
  const reply = await forumService.createReply(req.params.id, req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, "Reply posted successfully", reply));
});

export const deleteThread = asyncHandler(async (req, res) => {
  await forumService.deleteThread(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Thread deleted successfully", null));
});

export const deleteReply = asyncHandler(async (req, res) => {
  await forumService.deleteReply(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Reply deleted successfully", null));
});

export const toggleThreadLock = asyncHandler(async (req, res) => {
  const thread = await forumService.toggleThreadLock(req.params.id);
  const message = thread.isLocked ? "Thread locked" : "Thread unlocked";
  res.status(200).json(new ApiResponse(200, message, thread));
});

export const toggleThreadPin = asyncHandler(async (req, res) => {
  const thread = await forumService.toggleThreadPin(req.params.id);
  const message = thread.isPinned ? "Thread pinned" : "Thread unpinned";
  res.status(200).json(new ApiResponse(200, message, thread));
});
