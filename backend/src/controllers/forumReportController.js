import * as forumReportService from "../services/forumReportService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { REPORT_TARGET_TYPES } from "../constants/reportReasons.js";

export const reportThread = asyncHandler(async (req, res) => {
  const report = await forumReportService.createReport(
    REPORT_TARGET_TYPES.THREAD,
    req.params.id,
    req.user._id,
    req.body,
  );
  res.status(201).json(new ApiResponse(201, "Thread reported. Thank you.", report));
});

export const reportReply = asyncHandler(async (req, res) => {
  const report = await forumReportService.createReport(
    REPORT_TARGET_TYPES.REPLY,
    req.params.id,
    req.user._id,
    req.body,
  );
  res.status(201).json(new ApiResponse(201, "Reply reported. Thank you.", report));
});

export const listReports = asyncHandler(async (req, res) => {
  const reports = await forumReportService.listOpenReports();
  res.status(200).json(new ApiResponse(200, "Reports fetched successfully", reports));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await forumReportService.resolveReport(req.params.id);
  res.status(200).json(new ApiResponse(200, "Report resolved", report));
});
