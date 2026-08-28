import axiosInstance from "./axiosInstance";

export const fetchNotifications = (params = {}) =>
  axiosInstance.get("/me/notifications", { params });

export const fetchUnreadCount = () => axiosInstance.get("/me/notifications/unread-count");

export const markNotificationRead = (id) =>
  axiosInstance.patch(`/me/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  axiosInstance.patch("/me/notifications/read-all");

export const deleteNotification = (id) => axiosInstance.delete(`/me/notifications/${id}`);

export const fetchNotificationPreferences = () =>
  axiosInstance.get("/me/notification-preferences");

export const updateNotificationPreferences = (payload) =>
  axiosInstance.patch("/me/notification-preferences", payload);
