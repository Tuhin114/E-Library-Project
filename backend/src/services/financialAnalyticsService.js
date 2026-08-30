import Fee from "../models/Fee.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { serializeBook } from "../utils/sanitizeBook.js";
import { FEE_STATUS, FEE_STATUS_VALUES, PAYMENT_METHOD_VALUES } from "../constants/feeStatus.js";
import { FEE_TYPE_VALUES } from "../constants/feeType.js";

const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "90d": 90, all: null };
const DEFAULT_RANGE = "30d";
const DEFAULT_TOP_N = 10;
const PAYER_SELECT = "name avatar role";
const BOOK_POPULATE = [{ path: "authors", select: "name slug" }];

// Same range/since pattern as circulationAnalyticsService — kept as its
// own local copy for the same reason every analytics service already
// does this independently instead of sharing a utils file.
const getSinceDate = (range) => {
  const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS[DEFAULT_RANGE];
  if (!days) return null;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
};

const dateMatch = (field, since) => (since ? { [field]: { $gte: since } } : {});

const round2 = (value) => Math.round(value * 100) / 100;

// Same shape dailyCounts already produces elsewhere ([{ date, count }]),
// just summing amount instead of counting documents — so this reuses
// TimeSeriesChart on the frontend with zero changes to that component.
const dailySums = async (Model, dateField, sumField, since, extraMatch = {}) => {
  const rows = await Model.aggregate([
    { $match: { ...dateMatch(dateField, since), ...extraMatch } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
        count: { $sum: `$${sumField}` },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((row) => ({ date: row._id, count: round2(row.count) }));
};

// Deliberately NOT range-scoped, same reasoning as circulationAnalyticsService's
// loanStatusBreakdown/copyStatusBreakdown — "how much is currently
// outstanding" is a real-time operational figure, not a "how much became
// outstanding in the last 30 days" one.
// Follow-up (Phase 7 M3 shipped): FEE_STATUS gained `pending_review` and
// `waived` after this was first written. feeCountByStatus/
// feeAmountByStatus already zero-fill against FEE_STATUS_VALUES, so both
// picked up the new buckets automatically. collectionRate deliberately
// stays paid ÷ (paid + outstanding), excluding both new statuses on
// purpose: a pending_review fee isn't a confirmed charge yet (nothing to
// have "collected" against), and a waived fee was never going to be
// collected by design — folding either in would understate a librarian's
// actual collection performance on real, standing charges.
const getFeeStatusBreakdown = async () => {
  const rows = await Fee.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
  ]);
  const byStatus = Object.fromEntries(rows.map((row) => [row._id, row]));

  const feeCountByStatus = FEE_STATUS_VALUES.map((status) => ({
    label: status,
    count: byStatus[status]?.count || 0,
  }));
  const feeAmountByStatus = FEE_STATUS_VALUES.map((status) => ({
    label: status,
    count: round2(byStatus[status]?.amount || 0),
  }));

  const paidCount = byStatus[FEE_STATUS.PAID]?.count || 0;
  const outstandingCount = byStatus[FEE_STATUS.OUTSTANDING]?.count || 0;
  const totalCount = paidCount + outstandingCount;
  const collectionRate = totalCount > 0 ? round2((paidCount / totalCount) * 100) : null;

  return { feeCountByStatus, feeAmountByStatus, collectionRate };
};

// Real-time, same reasoning as getFeeStatusBreakdown — "what's driving
// the fees right now" is a snapshot question. Added once FEE_TYPE
// (late/damage/lost) existed; a late-fee-only library would just show a
// single bar here, which is a correct answer, not a broken one.
const getFeeAmountByType = async () => {
  const rows = await Fee.aggregate([
    { $group: { _id: "$type", amount: { $sum: "$amount" } } },
  ]);
  const byType = Object.fromEntries(rows.map((row) => [row._id, row.amount]));
  return FEE_TYPE_VALUES.map((type) => ({ label: type, count: round2(byType[type] || 0) }));
};

const getRevenueOverTime = (since) =>
  dailySums(Fee, "paidAt", "amount", since, { status: FEE_STATUS.PAID });

// Lateness/amount at the moment a fee is generated — scoped to when the
// fee was created (i.e. when the late return happened), not when it was
// eventually paid, since a fee's daysLate/amount never changes after
// creation (see feeService.createFeeForLateReturn). daysLate is null on
// damage/lost fees; $avg silently ignores nulls, so this already
// averages only over late fees without needing a $match on type.
const getAvgDaysLate = async (since) => {
  const [result] = await Fee.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: null, avgDaysLate: { $avg: "$daysLate" } } },
  ]);
  return result ? Math.round(result.avgDaysLate * 10) / 10 : null;
};

const getAvgFeeAmount = async (since) => {
  const [result] = await Fee.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: null, avgAmount: { $avg: "$amount" } } },
  ]);
  return result ? round2(result.avgAmount) : null;
};

// Only PAID fees have a paymentMethod (it's null until payFee runs), so
// this is naturally scoped to paidAt rather than createdAt — matches
// getRevenueOverTime's scope, since both describe money actually
// collected in the period, not fees merely generated in it.
const getPaymentMethodSplit = async (since) => {
  const rows = await Fee.aggregate([
    { $match: { status: FEE_STATUS.PAID, ...dateMatch("paidAt", since) } },
    { $group: { _id: "$paymentMethod", amount: { $sum: "$amount" } } },
  ]);
  const byMethod = Object.fromEntries(rows.map((row) => [row._id, row.amount]));
  return PAYMENT_METHOD_VALUES.map((method) => ({
    label: method,
    count: round2(byMethod[method] || 0),
  }));
};

// Top N books by total fee amount generated (late fees only, for now —
// M6's damage/lost replacement-cost fees will land in the same `amount`
// field once that ships, so this needs no changes to pick them up).
const getTopFeeGeneratingBooks = async (since, limit) => {
  const rows = await Fee.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: "$book", amount: { $sum: "$amount" } } },
    { $sort: { amount: -1 } },
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
      if (!book) return null; // book deleted since the fee was recorded
      return {
        ...serializeBook(book),
        metricLabel: "$ in fees",
        metricValue: round2(row.amount),
      };
    })
    .filter(Boolean);
};

// Top N students by total fee amount charged — surfaces who a
// librarian's "outstanding fees" conversation should actually be with.
// totalAmount includes both paid and outstanding fees generated in the
// period; outstandingAmount narrows to what's still owed right now,
// since that second number is what actually matters operationally.
const getTopFeePayers = async (since, limit) => {
  const rows = await Fee.aggregate([
    { $match: dateMatch("createdAt", since) },
    {
      $group: {
        _id: "$student",
        totalAmount: { $sum: "$amount" },
        outstandingAmount: {
          $sum: { $cond: [{ $eq: ["$status", FEE_STATUS.OUTSTANDING] }, "$amount", 0] },
        },
        feeCount: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: limit },
  ]);

  if (rows.length === 0) return [];

  const users = await User.find({ _id: { $in: rows.map((row) => row._id) } })
    .select(PAYER_SELECT)
    .lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return rows
    .map((row) => {
      const user = usersById.get(row._id.toString());
      if (!user) return null; // account deleted since the fee was recorded
      return {
        user: { _id: user._id, name: user.name, avatar: user.avatar, role: user.role },
        totalAmount: round2(row.totalAmount),
        outstandingAmount: round2(row.outstandingAmount),
        feeCount: row.feeCount,
      };
    })
    .filter(Boolean);
};

export const getFinancialAnalytics = async ({
  range = DEFAULT_RANGE,
  limit = DEFAULT_TOP_N,
} = {}) => {
  const since = getSinceDate(range);

  const [
    { feeCountByStatus, feeAmountByStatus, collectionRate },
    feeAmountByType,
    revenueOverTime,
    avgDaysLate,
    avgFeeAmount,
    paymentMethodSplit,
    topFeeGeneratingBooks,
    topFeePayers,
  ] = await Promise.all([
    getFeeStatusBreakdown(),
    getFeeAmountByType(),
    getRevenueOverTime(since),
    getAvgDaysLate(since),
    getAvgFeeAmount(since),
    getPaymentMethodSplit(since),
    getTopFeeGeneratingBooks(since, limit),
    getTopFeePayers(since, limit),
  ]);

  return {
    range,
    since,
    feeCountByStatus,
    feeAmountByStatus,
    feeAmountByType,
    collectionRate,
    revenueOverTime,
    avgDaysLate,
    avgFeeAmount,
    paymentMethodSplit,
    topFeeGeneratingBooks,
    topFeePayers,
  };
};
