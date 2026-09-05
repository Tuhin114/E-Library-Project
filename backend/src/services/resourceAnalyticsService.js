import Resource from "../models/Resource.js";
import SavedList from "../models/SavedList.js";
import SavedListItem from "../models/SavedListItem.js";
import User from "../models/User.js";
import { ROLE_VALUES } from "../constants/roles.js";
import { RESOURCE_TYPE_VALUES } from "../constants/resourceType.js";
import { RESOURCE_VISIBILITY_VALUES } from "../constants/resourceVisibility.js";
import { serializeResource } from "../utils/sanitizeResource.js";

// Same range/date helpers every other analytics service (engagement,
// circulation, financial) redefines locally rather than importing from
// one another — deliberate, established convention in this app: each
// analytics service is self-contained, not layered on a shared base.
const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "90d": 90, all: null };
const DEFAULT_RANGE = "30d";
const DEFAULT_TOP_N = 10;
const UPLOADER_SELECT = "name avatar role";

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

const getUploadsOverTime = (since) => dailyCounts(Resource, "createdAt", since);

// Real-time, not range-scoped — same reasoning catalogAnalyticsService's
// categoryDistribution/authorDistribution use: "what does the catalog
// look like right now" is a snapshot question, not a "what happened in
// the last 30 days" one. Zero-filled across every visibility value —
// same reasoning moderationAnalyticsService zero-fills reportsByReason:
// a missing bar reads as "no data," not "zero."
const getVisibilitySplit = async () => {
  const rows = await Resource.aggregate([
    { $group: { _id: "$visibility", count: { $sum: 1 } } },
  ]);
  const byVisibility = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return RESOURCE_VISIBILITY_VALUES.map((visibility) => ({
    label: visibility,
    count: byVisibility[visibility] || 0,
  }));
};

const getResourceTypeDistribution = async () => {
  const rows = await Resource.aggregate([
    { $group: { _id: "$resourceType", count: { $sum: 1 } } },
  ]);
  const byType = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return RESOURCE_TYPE_VALUES.map((type) => ({
    label: type,
    count: byType[type] || 0,
  }));
};

// The genuinely new axis this milestone adds that nothing else in the
// app tracks: who's actually contributing content, by role. Real-time
// (all-time composition), not range-scoped — topUploaders below is the
// range-scoped "who's active lately" view; this is "who has built the
// collection overall." Zero-filled across every role, same reasoning
// as visibilitySplit/resourceTypeDistribution above.
const getUploadsByRole = async () => {
  const rows = await Resource.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "uploadedBy",
        foreignField: "_id",
        as: "uploader",
      },
    },
    { $unwind: "$uploader" },
    { $group: { _id: "$uploader.role", count: { $sum: 1 } } },
  ]);
  const byRole = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return ROLE_VALUES.map((role) => ({ label: role, count: byRole[role] || 0 }));
};

// Top N non-empty subjects, most-used first — NOT zero-filled, unlike
// resourceType/visibility/role above. `subject` is free text a user
// types in (Phase 10 M1), not a fixed enum, so there's no finite list
// to zero-fill against — same reasoning catalogAnalyticsService's
// authorDistribution is top-N-only rather than zero-filled. Resources
// with no subject specified are excluded from this ranked list rather
// than lumped into a misleading "" bucket.
const getSubjectDistribution = async (limit) => {
  const rows = await Resource.aggregate([
    { $match: { subject: { $nin: ["", null] } } },
    { $group: { _id: "$subject", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return rows.map((row) => ({ label: row._id, count: row.count }));
};

// Demand-side signal, standing in for "most viewed." Flagged plainly:
// Resource has no view-tracking analogous to Book's RecentlyViewed —
// nothing records "a user opened this resource's detail page," and
// adding that just to power one analytics tile would be new tracking
// infrastructure, not an analytics change. SavedListItem counts are the
// honest signal this app actually has for "resources people find worth
// keeping." Mirrors catalogAnalyticsService's hydrateBookCounts pattern.
const getMostSavedResources = async (limit) => {
  const counted = await SavedListItem.aggregate([
    { $group: { _id: "$resource", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  if (counted.length === 0) return [];

  const resources = await Resource.find({
    _id: { $in: counted.map((entry) => entry._id) },
  })
    .populate({ path: "uploadedBy", select: "name" })
    .lean();
  const byId = new Map(resources.map((resource) => [resource._id.toString(), resource]));

  return counted
    .map((entry) => {
      const resource = byId.get(entry._id.toString());
      // Resource deleted after being saved — shouldn't happen given
      // Phase 10 M3's cascade-delete of SavedListItem on resource
      // delete, kept as a defensive guard rather than assumed.
      if (!resource) return null;
      return {
        ...serializeResource(resource),
        metricLabel: "saves",
        metricValue: entry.count,
      };
    })
    .filter(Boolean);
};

// Range-scoped — "who's been uploading lately," the recent-activity
// counterpart to uploadsByRole's all-time composition view. Same
// shape/precedent as engagementAnalyticsService.getTopContributors and
// getTopBorrowers.
const getTopUploaders = async (since, limit) => {
  const rows = await Resource.aggregate([
    { $match: dateMatch("createdAt", since) },
    { $group: { _id: "$uploadedBy", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  if (rows.length === 0) return [];

  const users = await User.find({ _id: { $in: rows.map((row) => row._id) } })
    .select(UPLOADER_SELECT)
    .lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return rows
    .map((row) => {
      const user = usersById.get(row._id.toString());
      if (!user) return null; // account deleted since the upload was recorded
      return {
        user: { _id: user._id, name: user.name, avatar: user.avatar, role: user.role },
        uploadCount: row.count,
      };
    })
    .filter(Boolean);
};

// Real-time snapshot, single object (not exportable — same reasoning
// engagementAnalyticsService's onTimeReturnRate and financialAnalyticsService's
// collectionRate aren't: a single number/object has nothing tabular to
// export). avgItemsPerList rounds to one decimal so it reads as a real
// average, not a misleadingly precise float.
const getSavedListAdoption = async () => {
  const [totalLists, itemRows] = await Promise.all([
    SavedList.countDocuments({}),
    SavedListItem.aggregate([{ $group: { _id: "$list", itemCount: { $sum: 1 } } }]),
  ]);

  const totalItems = itemRows.reduce((sum, row) => sum + row.itemCount, 0);
  const listsWithItems = itemRows.length;

  return {
    totalLists,
    totalItems,
    avgItemsPerList: totalLists > 0 ? Math.round((totalItems / totalLists) * 10) / 10 : 0,
    listsWithZeroItems: Math.max(totalLists - listsWithItems, 0),
  };
};

export const getResourceAnalytics = async ({
  range = DEFAULT_RANGE,
  limit = DEFAULT_TOP_N,
} = {}) => {
  const since = getSinceDate(range);

  const [
    totalResources,
    visibilitySplit,
    resourceTypeDistribution,
    uploadsByRole,
    subjectDistribution,
    mostSavedResources,
    topUploaders,
    savedListAdoption,
    uploadsOverTime,
  ] = await Promise.all([
    Resource.countDocuments({}),
    getVisibilitySplit(),
    getResourceTypeDistribution(),
    getUploadsByRole(),
    getSubjectDistribution(limit),
    getMostSavedResources(limit),
    getTopUploaders(since, limit),
    getSavedListAdoption(),
    getUploadsOverTime(since),
  ]);

  return {
    range,
    since, // null when range === "all" — the frontend uses this to label the period
    totalResources,
    visibilitySplit,
    resourceTypeDistribution,
    uploadsByRole,
    subjectDistribution,
    mostSavedResources,
    topUploaders,
    savedListAdoption,
    uploadsOverTime,
  };
};
