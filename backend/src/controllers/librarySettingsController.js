import * as librarySettingsService from "../services/librarySettingsService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await librarySettingsService.getSettings();
  res.status(200).json(new ApiResponse(200, "Settings fetched successfully", settings));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await librarySettingsService.updateSettings(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, "Settings updated successfully", settings));
});
