import * as profileService from "../services/profileService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await profileService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, "Profile updated successfully", user));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file provided");
  const user = await profileService.uploadAvatar(req.user._id, req.file);
  res.status(200).json(new ApiResponse(200, "Avatar uploaded successfully", user));
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await profileService.removeAvatar(req.user._id);
  res.status(200).json(new ApiResponse(200, "Avatar removed successfully", user));
});

export const getSavedSearches = asyncHandler(async (req, res) => {
  const searches = await profileService.listSavedSearches(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, "Saved searches fetched successfully", searches));
});

export const createSavedSearch = asyncHandler(async (req, res) => {
  const search = await profileService.createSavedSearch(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, "Search saved successfully", search));
});

export const deleteSavedSearch = asyncHandler(async (req, res) => {
  await profileService.deleteSavedSearch(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, "Saved search deleted successfully", null));
});
