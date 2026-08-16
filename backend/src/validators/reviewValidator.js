import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const createReviewSchema = z.object({
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().max(1000, "Comment cannot exceed 1000 characters").optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reviewIdParamSchema = z.object({
  id: objectIdSchema,
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
