import { z } from "zod";

export const publisherSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Publisher name must be at least 2 characters")
    .max(150, "Publisher name cannot exceed 150 characters"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
});
