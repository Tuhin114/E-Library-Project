import * as bookCopyService from "../services/bookCopyService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addCopies = asyncHandler(async (req, res) => {
  const copies = await bookCopyService.addCopies(req.params.id, req.body);
  res
    .status(201)
    .json(new ApiResponse(201, `${copies.length} copy/copies added`, copies));
});

export const listCopies = asyncHandler(async (req, res) => {
  const copies = await bookCopyService.listCopiesForBook(
    req.params.id,
    req.query,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Copies fetched successfully", copies));
});

export const getInventorySummary = asyncHandler(async (req, res) => {
  const summary = await bookCopyService.getInventorySummary(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Inventory summary fetched successfully", summary));
});

export const updateCopy = asyncHandler(async (req, res) => {
  const copy = await bookCopyService.updateCopy(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, "Copy updated successfully", copy));
});

export const deleteCopy = asyncHandler(async (req, res) => {
  await bookCopyService.deleteCopy(req.params.id);
  res.status(200).json(new ApiResponse(200, "Copy deleted successfully", null));
});
