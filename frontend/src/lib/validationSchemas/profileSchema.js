import { z } from "zod";

/**
 * Mirrors backend/src/validators/profileValidator.js updateProfileSchema.
 */
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  bio: z
    .string()
    .trim()
    .max(300, "Bio cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
});

export const saveSearchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
});
