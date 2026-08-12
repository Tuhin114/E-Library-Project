import { z } from "zod";

export const authorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name cannot exceed 100 characters"),
  bio: z
    .string()
    .trim()
    .max(2000, "Bio cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
});
