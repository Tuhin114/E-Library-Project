import * as catalogAnalyticsService from "../services/catalogAnalyticsService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCatalogAnalytics = asyncHandler(async (req, res) => {
  const analytics = await catalogAnalyticsService.getCatalogAnalytics(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Catalog analytics fetched successfully", analytics));
});
