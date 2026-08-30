import { z } from "zod";
import {
  CATALOG_EXPORT_DATASETS,
  ENGAGEMENT_EXPORT_DATASETS,
  MODERATION_EXPORT_DATASETS,
  CIRCULATION_EXPORT_DATASETS,
  FINANCIAL_EXPORT_DATASETS,
  AUTOMATION_EXPORT_DATASETS,
} from "../services/analyticsExportService.js";

// Same coercion pattern other query validators use (e.g. bookQuerySchema)
// — query strings arrive as strings, z.coerce turns "20" into 20 before
// the handler ever sees it.
export const catalogAnalyticsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .optional(),
});

export const engagementAnalyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .optional(),
});

export const moderationAnalyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
});

export const circulationAnalyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .optional(),
});

export const financialAnalyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .optional(),
});

export const automationAnalyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
});

// z.enum needs a non-empty tuple, not a plain string[] — spread into a
// tuple literal so this stays derived from analyticsExportService's
// dataset maps instead of a second hand-maintained list that could
// drift out of sync with what the service actually supports.
export const catalogExportQuerySchema = z.object({
  dataset: z.enum(CATALOG_EXPORT_DATASETS),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const engagementExportQuerySchema = z.object({
  dataset: z.enum(ENGAGEMENT_EXPORT_DATASETS),
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const moderationExportQuerySchema = z.object({
  dataset: z.enum(MODERATION_EXPORT_DATASETS),
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
});

export const circulationExportQuerySchema = z.object({
  dataset: z.enum(CIRCULATION_EXPORT_DATASETS),
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const financialExportQuerySchema = z.object({
  dataset: z.enum(FINANCIAL_EXPORT_DATASETS),
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const automationExportQuerySchema = z.object({
  dataset: z.enum(AUTOMATION_EXPORT_DATASETS),
  range: z.enum(["7d", "30d", "90d", "all"]).optional(),
});
