import * as notificationService from "../services/notificationService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listForUser(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, "Notifications fetched successfully", result));
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json(new ApiResponse(200, "Unread count fetched successfully", result));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, "Notification marked as read", notification));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, "All notifications marked as read", null));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, "Notification deleted", null));
});

export const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.getPreferences(req.user._id);
  res.status(200).json(new ApiResponse(200, "Notification preferences fetched successfully", preferences));
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.updatePreferences(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, "Notification preferences updated successfully", preferences));
});
