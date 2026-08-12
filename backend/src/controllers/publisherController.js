import * as publisherService from "../services/publisherService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPublisher = asyncHandler(async (req, res) => {
  const publisher = await publisherService.createPublisher(
    req.body,
    req.user._id,
  );
  res
    .status(201)
    .json(new ApiResponse(201, "Publisher created successfully", publisher));
});

export const getPublishers = asyncHandler(async (req, res) => {
  const publishers = await publisherService.getPublishers();
  res
    .status(200)
    .json(new ApiResponse(200, "Publishers fetched successfully", publishers));
});

export const getPublisherById = asyncHandler(async (req, res) => {
  const publisher = await publisherService.getPublisherById(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Publisher fetched successfully", publisher));
});

export const getPublisherBySlug = asyncHandler(async (req, res) => {
  const publisher = await publisherService.getPublisherBySlug(req.params.slug);
  res
    .status(200)
    .json(new ApiResponse(200, "Publisher fetched successfully", publisher));
});

export const updatePublisher = asyncHandler(async (req, res) => {
  const publisher = await publisherService.updatePublisher(
    req.params.id,
    req.body,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Publisher updated successfully", publisher));
});

export const deletePublisher = asyncHandler(async (req, res) => {
  await publisherService.deletePublisher(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Publisher deleted successfully", null));
});
