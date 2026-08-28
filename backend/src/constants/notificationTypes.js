/**
 * Canonical notification categories, types, and delivery channels.
 * Preferences (User.notificationPreferences) are category-level, not
 * per-type — every `type` below belongs to exactly one of the three
 * categories, decided by the caller of notificationService.notify().
 */
export const NOTIFICATION_CATEGORIES = Object.freeze({
  CIRCULATION: "circulation",
  COMMUNITY: "community",
  ACCOUNT: "account",
});

export const NOTIFICATION_CATEGORY_VALUES = Object.values(NOTIFICATION_CATEGORIES);

export const NOTIFICATION_TYPES = Object.freeze({
  REQUEST_APPROVED: "request_approved",
  REQUEST_REJECTED: "request_rejected",
  FORUM_REPLY: "forum_reply",
  DISCUSSION_REPLY: "discussion_reply",
  REPORT_RESOLVED: "report_resolved",
  LOAN_DUE_SOON: "loan_due_soon",
});

export const DELIVERY_CHANNELS = Object.freeze({
  IN_APP: "in_app",
  EMAIL: "email",
});

export const DELIVERY_CHANNEL_VALUES = Object.values(DELIVERY_CHANNELS);
