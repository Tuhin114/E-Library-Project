import PhysicalRequest from "../models/PhysicalRequest.js";
import Loan from "../models/Loan.js";
import BookCopy from "../models/BookCopy.js";
import Book from "../models/Book.js";
import { serializeBook } from "../utils/sanitizeBook.js";
import { REQUEST_STATUS_VALUES } from "../constants/requestStatus.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import { COPY_STATUS, COPY_STATUS_VALUES } from "../constants/copyStatus.js";

const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "90d": 90, all: null };
const DEFAULT_RANGE = "30d";
const DEFAULT_TOP_N = 10;
const BOOK_POPULATE = [{ path: "authors", select: "name slug" }];

// Same range/since pattern as engagementAnalyticsService — kept as its
// own copy rather than a shared import so each analytics service stays
// independently readable, matching how catalog/engagement/moderation
// already each define this locally instead of sharing a utils file.
const getSinceDate = (range) => {
  const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS[DEFAULT_RANGE];
  if (!days) return null;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
};

const dateMatch = (field, since) => (since ? { [field]: { $gte: since } } : {});

const dailyCounts = async (Model, dateField, since) => {
  const rows = await Model.aggregate([
    { $match: dateMatch(dateField, since) },
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

// How many requests landed in each status this period, scoped to when
// the request was submitted. Zero-filled against the full status enum
// so a status nobody hit still shows as 0, not absent from the chart.
const getRequestFunnel = async (since) => {
  const rows = await PhysicalRequest.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const countByStatus = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return REQUEST_STATUS_VALUES.map((status) => ({
    label: status,
    count: countByStatus[status] || 0,
  }));
};

const getRequestsOverTime = (since) => dailyCounts(PhysicalRequest, "createdAt", since);

// Split of decided requests into auto-approved (M5 engine) vs a
// librarian's manual call, scoped to when the decision happened rather
// than when the request was submitted — a request filed before the
// range but decided within it is what "recent approval activity"
// actually means.
const getApprovalMix = async (since) => {
  const rows = await PhysicalRequest.aggregate([
    { $match: { decidedAt: { $ne: null }, ...dateMatch("decidedAt", since) } },
    { $group: { _id: "$autoApproved", count: { $sum: 1 } } },
  ]);
  const byFlag = Object.fromEntries(rows.map((row) => [String(row._id), row.count]));
  return { autoApproved: byFlag.true || 0, manual: byFlag.false || 0 };
};

// Avg days between a request being decided and the student actually
// collecting it — only meaningful for requests that made it all the way
// to a Loan, so this joins through Loan rather than reading off
// PhysicalRequest directly.
const getAvgDaysToCollection = async (since) => {
  const [result] = await Loan.aggregate([
    { $match: dateMatch("collectedAt", since) },
    {
      $lookup: {
        from: "physicalrequests",
        localField: "request",
        foreignField: "_id",
        as: "request",
      },
    },
    { $unwind: "$request" },
    {
      $project: {
        days: {
          $divide: [
            { $subtract: ["$collectedAt", "$request.decidedAt"] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    { $group: { _id: null, avgDays: { $avg: "$days" } } },
  ]);
  return result ? Math.round(result.avgDays * 10) / 10 : null;
};

const getAvgLoanDurationDays = async (since) => {
  const [result] = await Loan.aggregate([
    { $match: { status: LOAN_STATUS.RETURNED, ...dateMatch("returnedAt", since) } },
    {
      $project: {
        days: { $divide: [{ $subtract: ["$returnedAt", "$collectedAt"] }, 1000 * 60 * 60 * 24] },
      },
    },
    { $group: { _id: null, avgDays: { $avg: "$days" } } },
  ]);
  return result ? Math.round(result.avgDays * 10) / 10 : null;
};

// Deliberately NOT range-scoped — "how many loans are overdue right
// now" is a real-time operational figure, same as loanService's
// overdueOnly dashboard filter. Applying a date range here would answer
// a different, less useful question ("how many became overdue in the
// last 30 days").
const getLoanStatusBreakdown = async () => {
  const now = new Date();
  const [active, overdue, returned] = await Promise.all([
    Loan.countDocuments({ status: LOAN_STATUS.ACTIVE, dueDate: { $gte: now } }),
    Loan.countDocuments({ status: LOAN_STATUS.ACTIVE, dueDate: { $lt: now } }),
    Loan.countDocuments({ status: LOAN_STATUS.RETURNED }),
  ]);
  return [
    { label: "active", count: active },
    { label: "overdue", count: overdue },
    { label: "returned", count: returned },
  ];
};

// Also real-time, same reasoning as getLoanStatusBreakdown — mirrors
// bookCopyService.getInventorySummary's per-book breakdown, rolled up
// library-wide instead of scoped to one title.
const getCopyStatusBreakdown = async () => {
  const rows = await BookCopy.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const countByStatus = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return COPY_STATUS_VALUES.map((status) => ({
    label: status,
    count: countByStatus[status] || 0,
  }));
};

// Top N books by "% of non-retired copies currently issued" — the
// titles a librarian is most likely to need more copies of. Not scoped
// to Book.status the way catalog analytics scopes to published books:
// inventory management is a librarian-only concern regardless of
// whether a title is visible to students yet.
const getInventoryUtilization = async (limit) => {
  const rows = await BookCopy.aggregate([
    { $match: { status: { $ne: COPY_STATUS.RETIRED } } },
    {
      $group: {
        _id: "$book",
        total: { $sum: 1 },
        issued: { $sum: { $cond: [{ $eq: ["$status", COPY_STATUS.ISSUED] }, 1, 0] } },
      },
    },
    { $match: { total: { $gt: 0 } } },
    { $project: { utilization: { $multiply: [{ $divide: ["$issued", "$total"] }, 100] } } },
    { $sort: { utilization: -1 } },
    { $limit: limit },
  ]);

  if (rows.length === 0) return [];

  const books = await Book.find({ _id: { $in: rows.map((row) => row._id) } })
    .populate(BOOK_POPULATE)
    .lean();
  const byId = new Map(books.map((book) => [book._id.toString(), book]));

  return rows
    .map((row) => {
      const book = byId.get(row._id.toString());
      if (!book) return null; // book deleted since the copy count was taken
      return {
        ...serializeBook(book),
        metricLabel: "% copies issued",
        metricValue: Math.round(row.utilization),
      };
    })
    .filter(Boolean);
};

export const getCirculationAnalytics = async ({
  range = DEFAULT_RANGE,
  limit = DEFAULT_TOP_N,
} = {}) => {
  const since = getSinceDate(range);

  const [
    requestFunnel,
    requestsOverTime,
    approvalMix,
    avgDaysToCollection,
    avgLoanDurationDays,
    loanStatusBreakdown,
    copyStatusBreakdown,
    inventoryUtilization,
  ] = await Promise.all([
    getRequestFunnel(since),
    getRequestsOverTime(since),
    getApprovalMix(since),
    getAvgDaysToCollection(since),
    getAvgLoanDurationDays(since),
    getLoanStatusBreakdown(),
    getCopyStatusBreakdown(),
    getInventoryUtilization(limit),
  ]);

  return {
    range,
    since,
    requestFunnel,
    requestsOverTime,
    approvalMix,
    avgDaysToCollection,
    avgLoanDurationDays,
    loanStatusBreakdown,
    copyStatusBreakdown,
    inventoryUtilization,
  };
};
