import * as loanService from "../services/loanService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listLoans = asyncHandler(async (req, res) => {
  const loans = await loanService.listLoansForLibrarian(req.query);
  res.status(200).json(new ApiResponse(200, "Loans fetched successfully", loans));
});

export const getLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.getLoanById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Loan fetched successfully", loan));
});
