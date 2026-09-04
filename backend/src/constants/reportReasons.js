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
  // Phase 10 M2 — reuses the existing polymorphic ForumReport model
  // (targetType + targetId, no ref) rather than a separate report
  // model for resources; targetId just points at a Resource instead
  // of a ForumThread/ForumReply.
  RESOURCE: "resource",
});

export const REPORT_TARGET_TYPE_VALUES = Object.values(REPORT_TARGET_TYPES);

export const REPORT_STATUS = Object.freeze({
  OPEN: "open",
  RESOLVED: "resolved",
});

export const REPORT_STATUS_VALUES = Object.values(REPORT_STATUS);
