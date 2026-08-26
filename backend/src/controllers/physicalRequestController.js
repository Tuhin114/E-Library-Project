import * as physicalRequestService from "../services/physicalRequestService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createRequest = asyncHandler(async (req, res) => {
  const request = await physicalRequestService.createRequest(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, "Request submitted successfully", request));
});

export const listRequests = asyncHandler(async (req, res) => {
  const result = await physicalRequestService.listRequestsForLibrarian(req.query);
  res.status(200).json(new ApiResponse(200, "Requests fetched successfully", result));
});

export const getRequest = asyncHandler(async (req, res) => {
  const request = await physicalRequestService.getRequestById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Request fetched successfully", request));
});

export const approveRequest = asyncHandler(async (req, res) => {
  const request = await physicalRequestService.approveRequest(req.params.id, req.user, req.body.note);
  res.status(200).json(new ApiResponse(200, "Request approved", request));
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await physicalRequestService.rejectRequest(req.params.id, req.user, req.body.reason);
  res.status(200).json(new ApiResponse(200, "Request rejected", request));
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await physicalRequestService.cancelRequest(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, "Request cancelled", request));
});
