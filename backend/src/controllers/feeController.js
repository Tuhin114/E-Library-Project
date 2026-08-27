import * as feeService from "../services/feeService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listFees = asyncHandler(async (req, res) => {
  const fees = await feeService.listFeesForLibrarian(req.query);
  res.status(200).json(new ApiResponse(200, "Fees fetched successfully", fees));
});

export const getFee = asyncHandler(async (req, res) => {
  const fee = await feeService.getFeeById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Fee fetched successfully", fee));
});

export const payFee = asyncHandler(async (req, res) => {
  const fee = await feeService.payFee(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Fee paid successfully", fee));
});
