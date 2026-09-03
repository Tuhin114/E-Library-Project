import * as feeService from "../services/feeService.js";
import * as receiptService from "../services/receiptService.js";
import * as paymentService from "../services/paymentService.js";
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

// M3 (Phase 7)
export const finalizeFee = asyncHandler(async (req, res) => {
  const fee = await feeService.finalizeFee(req.params.id, req.user, req.body);
  res.status(200).json(new ApiResponse(200, "Fee finalized successfully", fee));
});

export const waiveFee = asyncHandler(async (req, res) => {
  const fee = await feeService.waiveFee(req.params.id, req.user, req.body);
  res.status(200).json(new ApiResponse(200, "Fee waived successfully", fee));
});

export const downloadFeeReceipt = asyncHandler(async (req, res) => {
  const { pdfBuffer, filename } = await receiptService.generateFeeReceipt(req.params.id, req.user);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(pdfBuffer);
});

// Phase 9 M2 — the student-initiated self-serve path. Creates a real
// Razorpay (test mode) payment link and hands the frontend the URL to
// redirect to. Nothing about the Fee itself changes here — it only
// moves to PAID once the webhook confirms the sandboxed payment
// actually completed.
export const checkoutFee = asyncHandler(async (req, res) => {
  const session = await paymentService.createCheckoutSession(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, "Checkout session created", session));
});
