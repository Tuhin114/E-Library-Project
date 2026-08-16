import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

// Partial update — every field optional, only what's provided gets
// applied (see profileService.updateProfile).
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  bio: z
    .string()
    .trim()
    .max(300, "Bio cannot exceed 300 characters")
    .optional(),
});

export const savedSearchSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  queryParams: z.record(z.string()).optional(),
});

export const savedSearchParamSchema = z.object({
  id: objectIdSchema,
});
