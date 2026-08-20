export const REPORT_REASONS = Object.freeze({
  SPAM: "spam",
  HARASSMENT: "harassment",
  INAPPROPRIATE: "inappropriate",
  OTHER: "other",
});

export const REPORT_REASON_VALUES = Object.values(REPORT_REASONS);

export const REPORT_TARGET_TYPES = Object.freeze({
  THREAD: "thread",
  REPLY: "reply",
});

export const REPORT_TARGET_TYPE_VALUES = Object.values(REPORT_TARGET_TYPES);

export const REPORT_STATUS = Object.freeze({
  OPEN: "open",
  RESOLVED: "resolved",
});

export const REPORT_STATUS_VALUES = Object.values(REPORT_STATUS);
