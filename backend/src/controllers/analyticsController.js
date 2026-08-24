import * as catalogAnalyticsService from "../services/catalogAnalyticsService.js";
import * as engagementAnalyticsService from "../services/engagementAnalyticsService.js";
import * as moderationAnalyticsService from "../services/moderationAnalyticsService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCatalogAnalytics = asyncHandler(async (req, res) => {
  const analytics = await catalogAnalyticsService.getCatalogAnalytics(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Catalog analytics fetched successfully", analytics));
});

export const getEngagementAnalytics = asyncHandler(async (req, res) => {
  const analytics = await engagementAnalyticsService.getEngagementAnalytics(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Engagement analytics fetched successfully", analytics));
});

export const getModerationAnalytics = asyncHandler(async (req, res) => {
  const analytics = await moderationAnalyticsService.getModerationAnalytics(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Moderation analytics fetched successfully", analytics));
});
