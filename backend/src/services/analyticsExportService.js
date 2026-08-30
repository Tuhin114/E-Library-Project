import * as catalogAnalyticsService from "./catalogAnalyticsService.js";
import * as engagementAnalyticsService from "./engagementAnalyticsService.js";
import * as moderationAnalyticsService from "./moderationAnalyticsService.js";
import * as circulationAnalyticsService from "./circulationAnalyticsService.js";
import { toCsv } from "../utils/toCsv.js";
import { ApiError } from "../utils/ApiError.js";

const BOOK_METRIC_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "authors", label: "Authors" },
  { key: "category", label: "Category" },
  { key: "metricLabel", label: "Metric" },
  { key: "metricValue", label: "Value" },
];

const mapBookRow = (book) => ({
  title: book.title,
  authors: (book.authors || []).map((a) => a.name).join("; "),
  category: book.category?.name || "",
  metricLabel: book.metricLabel,
  metricValue: book.metricValue,
});

const DEAD_STOCK_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "authors", label: "Authors" },
  { key: "publishedOn", label: "Published On" },
];

const mapDeadStockRow = (book) => ({
  title: book.title,
  authors: (book.authors || []).map((a) => a.name).join("; "),
  publishedOn: book.createdAt,
});

const DISTRIBUTION_COLUMNS = (labelHeader) => [
  { key: "label", label: labelHeader },
  { key: "bookCount", label: "Book Count" },
];

const TIME_SERIES_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "count", label: "Count" },
];

const CONTRIBUTOR_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "totalContributions", label: "Total" },
  { key: "reviews", label: "Reviews" },
  { key: "discussions", label: "Book Discussions" },
  { key: "discussionReplies", label: "Discussion Replies" },
  { key: "forumThreads", label: "Forum Threads" },
  { key: "forumReplies", label: "Forum Replies" },
];

const mapContributorRow = (entry) => ({
  name: entry.user.name,
  role: entry.user.role,
  totalContributions: entry.totalContributions,
  ...entry.breakdown,
});

const REASON_COLUMNS = [
  { key: "reason", label: "Reason" },
  { key: "count", label: "Count" },
];

// Shared by every Phase 8 M1 { label, count } dataset (request funnel,
// loan status, copy status) — same shape REASON_COLUMNS uses for
// moderation, just a header that fits a status/state label instead of
// a report reason.
const STATUS_COLUMNS = [
  { key: "label", label: "Status" },
  { key: "count", label: "Count" },
];

/**
 * Each dataset maps to: which array on the parent analytics response to
 * export, a row mapper (identity if the row shape is already flat), and
 * the CSV column set. Adding a new exportable dataset to an existing
 * category is a one-entry addition here — the route/controller stay
 * generic.
 */
const CATALOG_DATASETS = {
  mostFavorited: { columns: BOOK_METRIC_COLUMNS, mapRow: mapBookRow },
  mostViewed: { columns: BOOK_METRIC_COLUMNS, mapRow: mapBookRow },
  mostDiscussed: { columns: BOOK_METRIC_COLUMNS, mapRow: mapBookRow },
  topRated: { columns: BOOK_METRIC_COLUMNS, mapRow: mapBookRow },
  categoryDistribution: {
    columns: DISTRIBUTION_COLUMNS("Category"),
    mapRow: (row) => ({ label: row.category?.name || "Uncategorized", bookCount: row.bookCount }),
  },
  authorDistribution: {
    columns: DISTRIBUTION_COLUMNS("Author"),
    mapRow: (row) => ({ label: row.author?.name || "Unknown", bookCount: row.bookCount }),
  },
  deadStock: {
    columns: DEAD_STOCK_COLUMNS,
    mapRow: mapDeadStockRow,
    // deadStock is nested as { count, books } on the parent response,
    // unlike every other catalog dataset which is a top-level array —
    // this extractor handles that one shape difference.
    extractRows: (analytics) => analytics.deadStock.books,
  },
};

const ENGAGEMENT_DATASETS = {
  signupsOverTime: { columns: TIME_SERIES_COLUMNS, mapRow: (row) => row },
  reviewsOverTime: { columns: TIME_SERIES_COLUMNS, mapRow: (row) => row },
  communityPostsOverTime: { columns: TIME_SERIES_COLUMNS, mapRow: (row) => row },
  topContributors: { columns: CONTRIBUTOR_COLUMNS, mapRow: mapContributorRow },
};

const MODERATION_DATASETS = {
  reportsByReason: { columns: REASON_COLUMNS, mapRow: (row) => row },
  reportsFiledOverTime: { columns: TIME_SERIES_COLUMNS, mapRow: (row) => row },
  reportsResolvedOverTime: { columns: TIME_SERIES_COLUMNS, mapRow: (row) => row },
};

// inventoryUtilization reuses BOOK_METRIC_COLUMNS/mapBookRow as-is —
// it's the same { title, authors, category, metricLabel, metricValue }
// shape catalog's top-books datasets already export, just sourced from
// circulationAnalyticsService instead. approvalMix/avgDaysToCollection/
// avgLoanDurationDays aren't listed here on purpose: they're single
// numbers/objects, not arrays, so — same as engagement's totalUsers/
// activeUserCount — there's nothing tabular to export.
const CIRCULATION_DATASETS = {
  requestFunnel: { columns: STATUS_COLUMNS, mapRow: (row) => row },
  requestsOverTime: { columns: TIME_SERIES_COLUMNS, mapRow: (row) => row },
  loanStatusBreakdown: { columns: STATUS_COLUMNS, mapRow: (row) => row },
  copyStatusBreakdown: { columns: STATUS_COLUMNS, mapRow: (row) => row },
  inventoryUtilization: { columns: BOOK_METRIC_COLUMNS, mapRow: mapBookRow },
};

const buildExport = async ({ getAnalytics, datasetMap, dataset, query, filenamePrefix }) => {
  const config = datasetMap[dataset];
  if (!config) {
    // validateQuery already restricts `dataset` to a known enum per
    // category, so this should be unreachable in practice — kept as a
    // defensive 400 rather than trusting the enum alone.
    throw new ApiError(400, `Unknown export dataset: ${dataset}`);
  }

  const analytics = await getAnalytics(query);
  const rawRows = config.extractRows ? config.extractRows(analytics) : analytics[dataset];
  const rows = rawRows.map(config.mapRow);
  const csv = toCsv(rows, config.columns);

  const datePart = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}-${dataset}-${datePart}.csv`;

  return { csv, filename };
};

export const buildCatalogExport = (dataset, query) =>
  buildExport({
    getAnalytics: catalogAnalyticsService.getCatalogAnalytics,
    datasetMap: CATALOG_DATASETS,
    dataset,
    query,
    filenamePrefix: "catalog-analytics",
  });

export const buildEngagementExport = (dataset, query) =>
  buildExport({
    getAnalytics: engagementAnalyticsService.getEngagementAnalytics,
    datasetMap: ENGAGEMENT_DATASETS,
    dataset,
    query,
    filenamePrefix: "engagement-analytics",
  });

export const buildModerationExport = (dataset, query) =>
  buildExport({
    getAnalytics: moderationAnalyticsService.getModerationAnalytics,
    datasetMap: MODERATION_DATASETS,
    dataset,
    query,
    filenamePrefix: "moderation-analytics",
  });

export const buildCirculationExport = (dataset, query) =>
  buildExport({
    getAnalytics: circulationAnalyticsService.getCirculationAnalytics,
    datasetMap: CIRCULATION_DATASETS,
    dataset,
    query,
    filenamePrefix: "circulation-analytics",
  });

export const CATALOG_EXPORT_DATASETS = Object.keys(CATALOG_DATASETS);
export const ENGAGEMENT_EXPORT_DATASETS = Object.keys(ENGAGEMENT_DATASETS);
export const MODERATION_EXPORT_DATASETS = Object.keys(MODERATION_DATASETS);
export const CIRCULATION_EXPORT_DATASETS = Object.keys(CIRCULATION_DATASETS);
