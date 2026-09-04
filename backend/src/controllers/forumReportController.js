import * as forumReportService from "../services/forumReportService.js";
import * as resourceService from "../services/resourceService.js";
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

// Confirms the reporter can actually see this resource (same
// visibility rule as any other resource read) before accepting a
// report against it — otherwise a report could be used to fingerprint
// the existence of a private resource that isn't theirs.
export const reportResource = asyncHandler(async (req, res) => {
  await resourceService.getResourceById(req.params.id, req.user);

  const report = await forumReportService.createReport(
    REPORT_TARGET_TYPES.RESOURCE,
    req.params.id,
    req.user._id,
    req.body,
  );
  res.status(201).json(new ApiResponse(201, "Resource reported. Thank you.", report));
});

export const listReports = asyncHandler(async (req, res) => {
  const reports = await forumReportService.listOpenReports();
  res.status(200).json(new ApiResponse(200, "Reports fetched successfully", reports));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await forumReportService.resolveReport(req.params.id);
  res.status(200).json(new ApiResponse(200, "Report resolved", report));
});
