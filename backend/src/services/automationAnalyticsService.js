import PhysicalRequest from "../models/PhysicalRequest.js";
import Waitlist from "../models/Waitlist.js";
import Notification from "../models/Notification.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { WAITLIST_STATUS_VALUES } from "../constants/waitlistStatus.js";
import { NOTIFICATION_CATEGORY_VALUES } from "../constants/notificationTypes.js";

const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "90d": 90, all: null };
const DEFAULT_RANGE = "30d";

// Same range/since pattern every analytics service in this suite
// already uses independently — see circulationAnalyticsService.js for
// why this stays a local copy rather than a shared import.
const getSinceDate = (range) => {
  const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS[DEFAULT_RANGE];
  if (!days) return null;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
};

const dateMatch = (field, since) => (since ? { [field]: { $gte: since } } : {});

// Splits requests submitted in the window into three outcomes, mirroring
// exactly how physicalRequestService.createRequest decides them:
//   - autoApproved:        the M5 engine proved it safe and approved it directly.
//   - fellThroughToReview: approvalMode was automatic, but the engine
//                          couldn't prove safety (autoApprovalNote got
//                          set) — regardless of what happens to the
//                          request afterward, the engine passed this one
//                          to a human. Counted here whether it's still
//                          pending or has since been manually decided.
//   - manualOnly:          submitted while approvalMode was manual the
//                          whole time — the engine never touched it.
const getApprovalEngineBreakdown = async (since) => {
  const [autoApproved, fellThroughToReview, total] = await Promise.all([
    PhysicalRequest.countDocuments({
      autoApproved: true,
      ...dateMatch("createdAt", since),
    }),
    PhysicalRequest.countDocuments({
      autoApproved: { $ne: true },
      autoApprovalNote: { $nin: [null, ""] },
      ...dateMatch("createdAt", since),
    }),
    PhysicalRequest.countDocuments(dateMatch("createdAt", since)),
  ]);
  const manualOnly = total - autoApproved - fellThroughToReview;

  return [
    { label: "auto-approved", count: autoApproved },
    { label: "fell through to review", count: fellThroughToReview },
    { label: "manual (mode was off)", count: Math.max(manualOnly, 0) },
  ];
};

// Deliberately real-time, not range-scoped — same reasoning as every
// other "right now" figure in this suite: this is specifically the
// action-item count ("how many auto-flagged requests are sitting in my
// queue right now"), not a historical rate.
const getPendingReviewCount = () =>
  PhysicalRequest.countDocuments({
    status: REQUEST_STATUS.PENDING,
    autoApprovalNote: { $nin: [null, ""] },
  });

// Waitlist entries created in the window, by outcome. Zero-filled
// against the full status enum, same pattern requestFunnel/
// loanStatusBreakdown already use.
const getWaitlistFunnel = async (since) => {
  const rows = await Waitlist.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const countByStatus = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return WAITLIST_STATUS_VALUES.map((status) => ({
    label: status,
    count: countByStatus[status] || 0,
  }));
};

// Avg hours between a hold going out (notifiedAt) and the student
// actually claiming it. Waitlist has no dedicated "claimedAt" field —
// waitlistService.claimWaitlistEntry sets fulfilledRequest to the newly
// created PhysicalRequest at the exact moment of claim, so that
// request's own createdAt is the claim timestamp. Only meaningful for
// entries that were actually claimed, so this only looks at FULFILLED
// entries with a notifiedAt.
const getAvgHoursToClaim = async (since) => {
  const [result] = await Waitlist.aggregate([
    {
      $match: {
        status: "fulfilled",
        notifiedAt: { $ne: null },
        fulfilledRequest: { $ne: null },
        ...dateMatch("notifiedAt", since),
      },
    },
    {
      $lookup: {
        from: "physicalrequests",
        localField: "fulfilledRequest",
        foreignField: "_id",
        as: "request",
      },
    },
    { $unwind: "$request" },
    {
      $project: {
        hours: {
          $divide: [{ $subtract: ["$request.createdAt", "$notifiedAt"] }, 1000 * 60 * 60],
        },
      },
    },
    { $group: { _id: null, avgHours: { $avg: "$hours" } } },
  ]);
  return result ? Math.round(result.avgHours * 10) / 10 : null;
};

// Notifications created in the window, split by category into two
// parallel { label, count } series — how many went out, and what % of
// those have been read. Two series rather than one richer shape so both
// reuse LabeledBarList as-is, same as every other paired breakdown in
// this suite (M2's feeCountByStatus/feeAmountByStatus).
const getNotificationDeliveryStats = async (since) => {
  const rows = await Notification.aggregate([
    { $match: dateMatch("createdAt", since) },
    {
      $group: {
        _id: "$category",
        sent: { $sum: 1 },
        read: { $sum: { $cond: ["$isRead", 1, 0] } },
      },
    },
  ]);
  const byCategory = Object.fromEntries(rows.map((row) => [row._id, row]));

  const notificationsSentByCategory = NOTIFICATION_CATEGORY_VALUES.map((category) => ({
    label: category,
    count: byCategory[category]?.sent || 0,
  }));
  const notificationReadRateByCategory = NOTIFICATION_CATEGORY_VALUES.map((category) => {
    const stats = byCategory[category];
    const rate = stats && stats.sent > 0 ? Math.round((stats.read / stats.sent) * 100) : null;
    return { label: category, count: rate ?? 0 };
  });

  return { notificationsSentByCategory, notificationReadRateByCategory };
};

export const getAutomationAnalytics = async ({ range = DEFAULT_RANGE } = {}) => {
  const since = getSinceDate(range);

  const [
    approvalEngineBreakdown,
    pendingReviewCount,
    waitlistFunnel,
    avgHoursToClaim,
    { notificationsSentByCategory, notificationReadRateByCategory },
  ] = await Promise.all([
    getApprovalEngineBreakdown(since),
    getPendingReviewCount(),
    getWaitlistFunnel(since),
    getAvgHoursToClaim(since),
    getNotificationDeliveryStats(since),
  ]);

  return {
    range,
    since,
    approvalEngineBreakdown,
    pendingReviewCount,
    waitlistFunnel,
    avgHoursToClaim,
    notificationsSentByCategory,
    notificationReadRateByCategory,
  };
};
