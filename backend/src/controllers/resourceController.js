import * as resourceService from "../services/resourceService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.createResource(
    req.body,
    req.user._id,
  );
  res
    .status(201)
    .json(new ApiResponse(201, "Resource uploaded successfully", resource));
});

export const getResources = asyncHandler(async (req, res) => {
  const result = await resourceService.listResources(req.query, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, "Resources fetched successfully", result));
});

export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById(
    req.params.id,
    req.user,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Resource fetched successfully", resource));
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.updateResource(
    req.params.id,
    req.user,
    req.body,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Resource updated successfully", resource));
});

export const deleteResource = asyncHandler(async (req, res) => {
  await resourceService.deleteResource(req.params.id, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, "Resource deleted successfully", null));
});

export const uploadResourceFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file provided");
  const resource = await resourceService.uploadResourceFile(
    req.params.id,
    req.user,
    req.file,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "File uploaded successfully", resource));
});

export const deleteResourceFile = asyncHandler(async (req, res) => {
  const resource = await resourceService.deleteResourceFile(
    req.params.id,
    req.user,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "File deleted successfully", resource));
});
