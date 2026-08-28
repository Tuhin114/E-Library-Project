import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";
import {
  DELIVERY_CHANNELS,
  NOTIFICATION_CATEGORY_VALUES,
} from "../constants/notificationTypes.js";
import { emitToUser } from "../config/socket.js";
import * as emailService from "./emailService.js";

/**
 * The single reusable entry point every other service calls to notify
 * a user. Writes the Notification, checks that user's category
 * preference, and fans out to whichever channels are actually enabled
 * — the caller never has to know or care about sockets/SMTP.
 *
 * A failure in either delivery channel never fails the caller's own
 * operation (e.g. approving a request must succeed even if the
 * student's email bounces) — this function swallows and logs delivery
 * errors rather than throwing, after the Notification document itself
 * has been durably written.
 */
export const notify = async ({
  user,
  category,
  type,
  title,
  message,
  link = "",
  relatedEntity = null,
}) => {
  const userId = typeof user === "object" ? user._id : user;

  const recipient =
    typeof user === "object" && user.notificationPreferences
      ? user
      : await User.findById(userId).select(
          "email name notificationPreferences",
        );
  if (!recipient) return null;

  const preferences = recipient.notificationPreferences?.[category] ?? {
    inApp: true,
    email: false,
  };

  console.log("[notificationService] DEBUG", {
    userId: userId.toString(),
    category,
    rawPreferences: recipient.notificationPreferences,
    categoryPreferences: recipient.notificationPreferences?.[category],
    effectivePreferences: preferences,
    inApp: preferences.inApp,
    email: preferences.email,
  });

  const deliveredVia = [];

  if (preferences.inApp) deliveredVia.push(DELIVERY_CHANNELS.IN_APP);
  if (preferences.email) deliveredVia.push(DELIVERY_CHANNELS.EMAIL);

  const notification = await Notification.create({
    user: userId,
    category,
    type,
    title,
    message,
    link,
    relatedEntity: relatedEntity ?? {},
    deliveredVia,
  });

  console.log(
    `[notificationService] ${type} → user=${userId}, inApp=${preferences.inApp}, email=${preferences.email}`,
  );

  if (preferences.inApp) {
    emitToUser(userId, "notification:new", notification);
  }

  if (preferences.email) {
    try {
      await emailService.sendNotificationEmail(recipient, {
        title,
        message,
        link,
      });
    } catch (error) {
      console.error(
        `[notificationService] Failed to email notification to ${recipient.email}:`,
        error.message,
      );
    }
  }

  return notification;
};

export const listForUser = async (userId, query = {}) => {
  const { page, limit, skip } = getPaginationParams(query, {
    defaultLimit: 20,
    maxLimit: 50,
  });
  const filter = {
    user: userId,
    ...(query.unreadOnly === "true" && { isRead: false }),
  };

  const [notifications, totalItems] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  };
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });
  return { count };
};

const assertOwnedNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });
  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await assertOwnedNotification(notificationId, userId);
  notification.isRead = true;
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } },
  );
};

export const deleteNotification = async (userId, notificationId) => {
  const notification = await assertOwnedNotification(notificationId, userId);
  await notification.deleteOne();
};

const DEFAULT_PREFERENCES = Object.fromEntries(
  NOTIFICATION_CATEGORY_VALUES.map((category) => [
    category,
    { inApp: true, email: category !== "community" },
  ]),
);

export const getPreferences = async (userId) => {
  const user = await User.findById(userId).select("notificationPreferences");
  if (!user) throw new ApiError(404, "User not found");
  return user.notificationPreferences ?? DEFAULT_PREFERENCES;
};

// Partial, category-keyed update — { circulation: { email: false } }
// only touches circulation.email, every other category/channel stays
// as-is. Mongoose's dot-path $set (not a whole-document overwrite)
// keeps this safe against a payload that only specifies a subset.
export const updatePreferences = async (userId, payload) => {
  const setOps = {};
  for (const [category, channels] of Object.entries(payload)) {
    if (!NOTIFICATION_CATEGORY_VALUES.includes(category)) continue;
    for (const [channel, value] of Object.entries(channels)) {
      setOps[`notificationPreferences.${category}.${channel}`] = value;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: setOps },
    { new: true, runValidators: true },
  ).select("notificationPreferences");

  if (!user) throw new ApiError(404, "User not found");
  return user.notificationPreferences;
};
