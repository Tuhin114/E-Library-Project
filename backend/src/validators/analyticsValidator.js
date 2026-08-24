import { z } from "zod";

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
