import * as loanService from "../services/loanService.js";
import * as receiptService from "../services/receiptService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listLoans = asyncHandler(async (req, res) => {
  const loans = await loanService.listLoansForLibrarian(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Loans fetched successfully", loans));
});

export const getLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.getLoanById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Loan fetched successfully", loan));
});

// M4 — processes a return. Response includes the fee if the return was
// late, or null if it wasn't — the frontend branches on that directly
// rather than needing a second request to check.
export const returnLoan = asyncHandler(async (req, res) => {
  const result = await loanService.returnLoan(
    req.params.id,
    req.user,
    req.body,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Loan returned successfully", result));
});

// M2 (Phase 7) — extends the loan's due date per LibrarySettings.
// Rejection reasons (overdue, max renewals hit, active waitlist) come
// back as the ApiError's own message, same as every other domain
// error in this codebase — no special response shape needed.
export const renewLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.renewLoan(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Loan renewed successfully", loan));
});

// M3 (Phase 7) — closes out the loan and generates a PENDING_REVIEW
// replacement-cost fee. Response shape mirrors returnLoan's own
// { loan, fee } — the frontend can reuse the same "did this produce a
// fee to show" branch for both.
export const reportLoanLost = asyncHandler(async (req, res) => {
  const result = await loanService.reportLoanLost(
    req.params.id,
    req.user,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, "Loan reported lost", result));
});

export const downloadLoanReceipt = asyncHandler(async (req, res) => {
  const { pdfBuffer, filename } = await receiptService.generateLoanReceipt(req.params.id, req.user);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(pdfBuffer);
});

export const setLoanDueDateForTesting = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(404, "Not found");
  }

  const loan = await loanService.setLoanDueDateForTesting(
    req.params.id,
    req.body.dueDate,
  );

  res.status(200).json(new ApiResponse(200, "Loan due date updated", loan));
});
