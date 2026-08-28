import * as notificationApi from "../api/notificationApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getNotifications = async (params = {}) => {
  try {
    const { data } = await notificationApi.fetchNotifications(params);
    return data.data; // { notifications, pagination }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getUnreadCount = async () => {
  try {
    const { data } = await notificationApi.fetchUnreadCount();
    return data.data.count;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markAsRead = async (id) => {
  try {
    const { data } = await notificationApi.markNotificationRead(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markAllAsRead = async () => {
  try {
    await notificationApi.markAllNotificationsRead();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const removeNotification = async (id) => {
  try {
    await notificationApi.deleteNotification(id);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getPreferences = async () => {
  try {
    const { data } = await notificationApi.fetchNotificationPreferences();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const savePreferences = async (payload) => {
  try {
    const { data } =
      await notificationApi.updateNotificationPreferences(payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Could not update notification preferences. Please try again.",
      ),
    );
  }
};
