import * as catalogAnalyticsService from "../services/catalogAnalyticsService.js";
import * as engagementAnalyticsService from "../services/engagementAnalyticsService.js";
import * as moderationAnalyticsService from "../services/moderationAnalyticsService.js";
import * as circulationAnalyticsService from "../services/circulationAnalyticsService.js";
import * as analyticsExportService from "../services/analyticsExportService.js";
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

export const getCirculationAnalytics = asyncHandler(async (req, res) => {
  const analytics = await circulationAnalyticsService.getCirculationAnalytics(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Circulation analytics fetched successfully", analytics));
});

// CSV export handlers send raw text, not the ApiResponse{success,message,data}
// envelope every other route in this app uses — a CSV file has no room
// for a wrapper, and Content-Disposition is what actually triggers the
// browser's "save as" behavior on the frontend's blob-download flow.
const sendCsv = (res, { csv, filename }) => {
  res.status(200);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};

export const exportCatalogAnalytics = asyncHandler(async (req, res) => {
  const { dataset, ...query } = req.query;
  const result = await analyticsExportService.buildCatalogExport(dataset, query);
  sendCsv(res, result);
});

export const exportEngagementAnalytics = asyncHandler(async (req, res) => {
  const { dataset, ...query } = req.query;
  const result = await analyticsExportService.buildEngagementExport(dataset, query);
  sendCsv(res, result);
});

export const exportModerationAnalytics = asyncHandler(async (req, res) => {
  const { dataset, ...query } = req.query;
  const result = await analyticsExportService.buildModerationExport(dataset, query);
  sendCsv(res, result);
});

export const exportCirculationAnalytics = asyncHandler(async (req, res) => {
  const { dataset, ...query } = req.query;
  const result = await analyticsExportService.buildCirculationExport(dataset, query);
  sendCsv(res, result);
});
