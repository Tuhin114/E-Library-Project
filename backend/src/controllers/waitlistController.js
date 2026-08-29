import * as waitlistService from "../services/waitlistService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const joinWaitlist = asyncHandler(async (req, res) => {
  const entry = await waitlistService.joinWaitlist(req.params.id, req.user._id);
  res.status(201).json(new ApiResponse(201, "Added to the waitlist", entry));
});

export const getWaitlistForBook = asyncHandler(async (req, res) => {
  const entries = await waitlistService.listForBook(req.params.id);
  res.status(200).json(new ApiResponse(200, "Waitlist fetched successfully", entries));
});

export const getMyWaitlist = asyncHandler(async (req, res) => {
  const entries = await waitlistService.listForUser(req.user._id);
  res.status(200).json(new ApiResponse(200, "Your waitlist entries fetched successfully", entries));
});

export const cancelWaitlistEntry = asyncHandler(async (req, res) => {
  await waitlistService.cancelWaitlistEntry(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, "Left the waitlist", null));
});

export const claimWaitlistEntry = asyncHandler(async (req, res) => {
  const request = await waitlistService.claimWaitlistEntry(req.params.id, req.user._id, req.body);
  res
    .status(201)
    .json(new ApiResponse(201, "Hold claimed — your request has been auto-approved", request));
});
