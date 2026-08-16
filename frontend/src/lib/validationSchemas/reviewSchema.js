import { z } from "zod";

/**
 * Mirrors backend/src/validators/reviewValidator.js createReviewSchema.
 */
export const reviewSchema = z.object({
  rating: z
    .number({ required_error: "Please select a rating" })
    .int()
    .min(1, "Please select a rating")
    .max(5, "Please select a rating"),
  comment: z
    .string()
    .trim()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});
