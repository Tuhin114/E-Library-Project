import User from "../models/User.js";
import Review from "../models/Review.js";
import Discussion from "../models/Discussion.js";
import DiscussionReply from "../models/DiscussionReply.js";
import ForumThread from "../models/ForumThread.js";
import ForumReply from "../models/ForumReply.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import ReadingProgress from "../models/ReadingProgress.js";
import Loan from "../models/Loan.js";
import Fee from "../models/Fee.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import { FEE_STATUS } from "../constants/feeStatus.js";
import { ROLES } from "../constants/roles.js";

const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "90d": 90, all: null };
const DEFAULT_RANGE = "30d";
const DEFAULT_TOP_N = 10;
const CONTRIBUTOR_SELECT = "name avatar role";

// `all` means "no lower bound" — every count below simply omits the
// createdAt/lastReadAt/viewedAt match clause in that case, rather than
// this returning some arbitrary epoch date.
const getSinceDate = (range) => {
  const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS[DEFAULT_RANGE];
  if (!days) return null;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
};

const dateMatch = (field, since) => (since ? { [field]: { $gte: since } } : {});

/**
 * Groups a model's documents into daily counts by `dateField`, scoped
 * to `since` if provided. Shared by signups/reviews/community-posts
 * time series so all three use the exact same bucketing logic and
 * response shape: [{ date: "2026-08-01", count: 4 }, ...] ascending.
 */
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

/**
 * Merges several { date, count } series (e.g. Discussion + DiscussionReply
 * + ForumThread + ForumReply — all "a post happened" events, just on
 * different models) into one series summed by date. Missing dates in
 * either input are treated as 0, not dropped.
 */
const mergeDailySeries = (...seriesList) => {
  const byDate = new Map();
  for (const series of seriesList) {
    for (const { date, count } of series) {
      byDate.set(date, (byDate.get(date) || 0) + count);
    }
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));
};

const getSignupsOverTime = (since) => dailyCounts(User, "createdAt", since);

const getReviewsOverTime = (since) => dailyCounts(Review, "createdAt", since);

const getCommunityPostsOverTime = async (since) => {
  const [discussions, discussionReplies, forumThreads, forumReplies] = await Promise.all([
    dailyCounts(Discussion, "createdAt", since),
    dailyCounts(DiscussionReply, "createdAt", since),
    dailyCounts(ForumThread, "createdAt", since),
    dailyCounts(ForumReply, "createdAt", since),
  ]);
  return mergeDailySeries(discussions, discussionReplies, forumThreads, forumReplies);
};

/**
 * "Active user" here means "touched a book or posted something in the
 * window" — there's no session/login tracking anywhere in the app, so
 * this is the closest honest proxy: distinct users with a RecentlyViewed
 * or ReadingProgress row updated in-range. Explicitly NOT the same as
 * "logged in" or "spent time in the app." Documented in M3_CHANGES.md,
 * not just here — this caveat matters enough to say to the librarian
 * directly, not bury in a code comment.
 */
const getActiveUserCount = async (since) => {
  const [viewedUserIds, readingUserIds] = await Promise.all([
    RecentlyViewed.distinct("user", dateMatch("viewedAt", since)),
    ReadingProgress.distinct("user", dateMatch("lastReadAt", since)),
  ]);
  const distinctIds = new Set([
    ...viewedUserIds.map((id) => id.toString()),
    ...readingUserIds.map((id) => id.toString()),
  ]);
  return distinctIds.size;
};

// One aggregation per contribution type rather than one giant $unionWith
// pipeline across 5 collections — each of these is already a cheap
// indexed group-by, and merging 5 small Maps in JS is easier to read
// (and debug) than a single sprawling aggregation pipeline would be.
const countByUser = async (Model, since) => {
  const rows = await Model.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  return rows;
};

const getTopContributors = async (since, limit) => {
  const [reviews, discussions, discussionReplies, forumThreads, forumReplies] =
    await Promise.all([
      countByUser(Review, since),
      countByUser(Discussion, since),
      countByUser(DiscussionReply, since),
      countByUser(ForumThread, since),
      countByUser(ForumReply, since),
    ]);

  const breakdown = new Map();
  const addCounts = (rows, key) => {
    for (const row of rows) {
      const userId = row._id.toString();
      if (!breakdown.has(userId)) {
        breakdown.set(userId, {
          reviews: 0,
          discussions: 0,
          discussionReplies: 0,
          forumThreads: 0,
          forumReplies: 0,
        });
      }
      breakdown.get(userId)[key] = row.count;
    }
  };

  addCounts(reviews, "reviews");
  addCounts(discussions, "discussions");
  addCounts(discussionReplies, "discussionReplies");
  addCounts(forumThreads, "forumThreads");
  addCounts(forumReplies, "forumReplies");

  const ranked = Array.from(breakdown.entries())
    .map(([userId, counts]) => ({
      userId,
      totalContributions: Object.values(counts).reduce((sum, n) => sum + n, 0),
      ...counts,
    }))
    .sort((a, b) => b.totalContributions - a.totalContributions)
    .slice(0, limit);

  if (ranked.length === 0) return [];

  const users = await User.find({ _id: { $in: ranked.map((r) => r.userId) } })
    .select(CONTRIBUTOR_SELECT)
    .lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return ranked
    .map((entry) => {
      const user = usersById.get(entry.userId);
      if (!user) return null; // account deleted since the activity was recorded
      return {
        user: { _id: user._id, name: user.name, avatar: user.avatar, role: user.role },
        totalContributions: entry.totalContributions,
        breakdown: {
          reviews: entry.reviews,
          discussions: entry.discussions,
          discussionReplies: entry.discussionReplies,
          forumThreads: entry.forumThreads,
          forumReplies: entry.forumReplies,
        },
      };
    })
    .filter(Boolean);
};

// Phase 8 M3 — Borrower & Risk Analytics. Reads Loan/Fee, which nothing
// in this file touched before now; kept in the *engagement* service
// rather than a new one on purpose — "who's actually using the
// library" is what this file already answers for community activity,
// and borrowing is the same question for circulation. A librarian
// reading "Engagement" shouldn't have to also check a separate
// "Circulation" tab to find out who their most active students are.

// Top N students by loans collected in the window, each with their own
// on-time-return rate — the ranked list a librarian actually needs when
// deciding who to trust with a longer loan or an auto-approval.
// onTimeReturnRate is null (not 0) when a borrower has no *returned*
// loans yet in range, since "0% on time" and "no data yet" are
// different facts a librarian shouldn't confuse.
const getTopBorrowers = async (since, limit) => {
  const rows = await Loan.aggregate([
    { $match: dateMatch("collectedAt", since) },
    {
      $group: {
        _id: "$student",
        loanCount: { $sum: 1 },
        returnedCount: {
          $sum: { $cond: [{ $eq: ["$status", LOAN_STATUS.RETURNED] }, 1, 0] },
        },
        onTimeCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", LOAN_STATUS.RETURNED] },
                  { $lte: ["$returnedAt", "$dueDate"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { loanCount: -1 } },
    { $limit: limit },
  ]);

  if (rows.length === 0) return [];

  const users = await User.find({ _id: { $in: rows.map((row) => row._id) } })
    .select(CONTRIBUTOR_SELECT)
    .lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return rows
    .map((row) => {
      const user = usersById.get(row._id.toString());
      if (!user) return null; // account deleted since the loan was recorded
      return {
        user: { _id: user._id, name: user.name, avatar: user.avatar, role: user.role },
        loanCount: row.loanCount,
        onTimeReturnRate:
          row.returnedCount > 0 ? Math.round((row.onTimeCount / row.returnedCount) * 100) : null,
      };
    })
    .filter(Boolean);
};

// Library-wide on-time-return rate, scoped to returns that happened in
// the window (not to when the loan was collected — a loan collected
// before the range but returned within it is what "recent return
// behavior" means). Deliberately a single number rather than a
// per-student figure: getTopBorrowers already gives the per-student
// breakdown for the students who matter most; duplicating it here for
// every borrower would just be the same data restated.
const getOnTimeReturnRate = async (since) => {
  const [result] = await Loan.aggregate([
    { $match: { status: LOAN_STATUS.RETURNED, ...dateMatch("returnedAt", since) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        onTime: { $sum: { $cond: [{ $lte: ["$returnedAt", "$dueDate"] }, 1, 0] } },
      },
    },
  ]);
  return result ? Math.round((result.onTime / result.total) * 100) : null;
};

// Deliberately real-time, not range-scoped — same reasoning as every
// other "right now" figure in this analytics suite (circulationAnalyticsService's
// loanStatusBreakdown, financialAnalyticsService's feeCountByStatus):
// "who currently owes money" is a snapshot a librarian needs as of this
// moment, not "who generated a fee in the last 30 days." Scoped to
// OUTSTANDING only — same definition M2's collectionRate uses — since a
// PENDING_REVIEW fee isn't a confirmed charge yet and a WAIVED one was
// deliberately forgiven; neither represents money actually owed.
const getAtRiskStudents = async (limit) => {
  const rows = await Fee.aggregate([
    { $match: { status: FEE_STATUS.OUTSTANDING } },
    {
      $group: {
        _id: "$student",
        outstandingAmount: { $sum: "$amount" },
        outstandingFeeCount: { $sum: 1 },
      },
    },
    { $sort: { outstandingAmount: -1 } },
    { $limit: limit },
  ]);

  if (rows.length === 0) return [];

  const users = await User.find({ _id: { $in: rows.map((row) => row._id) } })
    .select(CONTRIBUTOR_SELECT)
    .lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return rows
    .map((row) => {
      const user = usersById.get(row._id.toString());
      if (!user) return null; // account deleted since the fee was recorded
      return {
        user: { _id: user._id, name: user.name, avatar: user.avatar, role: user.role },
        outstandingAmount: Math.round(row.outstandingAmount * 100) / 100,
        outstandingFeeCount: row.outstandingFeeCount,
      };
    })
    .filter(Boolean);
};

// Histogram of "how many loans did each borrower collect in this
// window" — 0 / 1-2 / 3-5 / 6+. The 0 bucket is everyone eligible to
// borrow (student or faculty — librarians don't borrow against their
// own catalog) who collected nothing in-range, computed as
// totalBorrowerEligible minus the distinct set who show up in the loan
// aggregation at all.
const getBorrowingFrequencyDistribution = async (since) => {
  const [rows, totalBorrowerEligible] = await Promise.all([
    Loan.aggregate([
      { $match: dateMatch("collectedAt", since) },
      { $group: { _id: "$student", loanCount: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: { $ne: ROLES.LIBRARIAN } }),
  ]);

  const buckets = { "0": 0, "1-2": 0, "3-5": 0, "6+": 0 };
  for (const row of rows) {
    if (row.loanCount <= 2) buckets["1-2"] += 1;
    else if (row.loanCount <= 5) buckets["3-5"] += 1;
    else buckets["6+"] += 1;
  }
  buckets["0"] = Math.max(totalBorrowerEligible - rows.length, 0);

  return [
    { label: "0", count: buckets["0"] },
    { label: "1-2", count: buckets["1-2"] },
    { label: "3-5", count: buckets["3-5"] },
    { label: "6+", count: buckets["6+"] },
  ];
};

export const getEngagementAnalytics = async ({
  range = DEFAULT_RANGE,
  limit = DEFAULT_TOP_N,
} = {}) => {
  const since = getSinceDate(range);

  const [
    totalUsers,
    activeUserCount,
    signupsOverTime,
    reviewsOverTime,
    communityPostsOverTime,
    topContributors,
    topBorrowers,
    onTimeReturnRate,
    atRiskStudents,
    borrowingFrequencyDistribution,
  ] = await Promise.all([
    User.countDocuments({}),
    getActiveUserCount(since),
    getSignupsOverTime(since),
    getReviewsOverTime(since),
    getCommunityPostsOverTime(since),
    getTopContributors(since, limit),
    getTopBorrowers(since, limit),
    getOnTimeReturnRate(since),
    getAtRiskStudents(limit),
    getBorrowingFrequencyDistribution(since),
  ]);

  return {
    range,
    since, // null when range === "all" — the frontend uses this to label the period
    totalUsers,
    activeUserCount,
    signupsOverTime,
    reviewsOverTime,
    communityPostsOverTime,
    topContributors,
    topBorrowers,
    onTimeReturnRate,
    atRiskStudents,
    borrowingFrequencyDistribution,
  };
};
