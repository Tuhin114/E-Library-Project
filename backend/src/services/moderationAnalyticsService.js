import ForumReport from "../models/ForumReport.js";
import ForumThread from "../models/ForumThread.js";
import { REPORT_STATUS, REPORT_REASON_VALUES } from "../constants/reportReasons.js";

const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "90d": 90, all: null };
const DEFAULT_RANGE = "30d";

const getSinceDate = (range) => {
  const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS[DEFAULT_RANGE];
  if (!days) return null;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
};

const dateMatch = (field, since) => (since ? { [field]: { $gte: since } } : {});

// Same daily-bucketing shape M3's engagementAnalyticsService uses —
// [{ date: "2026-08-01", count: 4 }, ...] ascending — so the frontend's
// Sparkline component works unmodified against this milestone's data
// too.
const dailyCounts = async (Model, dateField, since, extraMatch = {}) => {
  const rows = await Model.aggregate([
    { $match: { ...dateMatch(dateField, since), ...extraMatch } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((row) => ({ date: row._id, count: row.count }));
};

const getReportCountsByStatus = async (since) => {
  const rows = await ForumReport.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const byStatus = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return {
    openCount: byStatus[REPORT_STATUS.OPEN] || 0,
    resolvedCount: byStatus[REPORT_STATUS.RESOLVED] || 0,
  };
};

const getReportsByReason = async (since) => {
  const rows = await ForumReport.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: "$reason", count: { $sum: 1 } } },
  ]);
  const byReason = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  // Zero-fill every known reason rather than only returning reasons that
  // happen to have a report — a bar chart with a silently missing
  // category reads as "no data" instead of "zero," which is the wrong
  // signal for a moderation dashboard.
  return REPORT_REASON_VALUES.map((reason) => ({
    reason,
    count: byReason[reason] || 0,
  }));
};

/**
 * Average resolve time in hours, computed ONLY over reports that have
 * a `resolvedAt` timestamp — i.e. resolved after Phase 5 M4 shipped.
 * Reports resolved before this field existed have `resolvedAt: null`
 * and are excluded, not treated as instant. `excludedLegacyCount`
 * surfaces exactly how many resolved reports couldn't be included, so
 * the number on screen doesn't quietly look more complete than it is.
 */
const getResolutionTimeStats = async (since) => {
  const [timed, legacyCount] = await Promise.all([
    ForumReport.aggregate([
      {
        $match: {
          status: REPORT_STATUS.RESOLVED,
          resolvedAt: { $ne: null },
          ...dateMatch("resolvedAt", since),
        },
      },
      {
        $project: {
          resolutionHours: {
            $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: "$resolutionHours" },
          resolvedWithTimestampCount: { $sum: 1 },
        },
      },
    ]),
    ForumReport.countDocuments({
      status: REPORT_STATUS.RESOLVED,
      resolvedAt: null,
      ...dateMatch("createdAt", since),
    }),
  ]);

  const result = timed[0];
  return {
    avgResolutionHours: result ? Math.round(result.avgResolutionHours * 10) / 10 : null,
    resolvedWithTimestampCount: result?.resolvedWithTimestampCount || 0,
    resolvedWithoutTimestampCount: legacyCount,
  };
};

const getThreadModerationCounts = async () => {
  const [lockedCount, pinnedCount] = await Promise.all([
    ForumThread.countDocuments({ isLocked: true }),
    ForumThread.countDocuments({ isPinned: true }),
  ]);
  return { lockedCount, pinnedCount };
};

export const getModerationAnalytics = async ({ range = DEFAULT_RANGE } = {}) => {
  const since = getSinceDate(range);

  const [
    statusCounts,
    reportsByReason,
    resolutionStats,
    threadModerationCounts,
    reportsFiledOverTime,
    reportsResolvedOverTime,
  ] = await Promise.all([
    getReportCountsByStatus(since),
    getReportsByReason(since),
    getResolutionTimeStats(since),
    getThreadModerationCounts(),
    dailyCounts(ForumReport, "createdAt", since),
    dailyCounts(ForumReport, "resolvedAt", since, { resolvedAt: { $ne: null } }),
  ]);

  return {
    range,
    since,
    ...statusCounts,
    reportsByReason,
    ...resolutionStats,
    ...threadModerationCounts,
    reportsFiledOverTime,
    reportsResolvedOverTime,
  };
};
