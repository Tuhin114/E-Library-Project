import User from "../models/User.js";
import Review from "../models/Review.js";
import Discussion from "../models/Discussion.js";
import DiscussionReply from "../models/DiscussionReply.js";
import ForumThread from "../models/ForumThread.js";
import ForumReply from "../models/ForumReply.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import ReadingProgress from "../models/ReadingProgress.js";

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
  ] = await Promise.all([
    User.countDocuments({}),
    getActiveUserCount(since),
    getSignupsOverTime(since),
    getReviewsOverTime(since),
    getCommunityPostsOverTime(since),
    getTopContributors(since, limit),
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
  };
};
