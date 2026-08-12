import { z } from "zod";

/**
 * Validation schema for creating an author.
 */
export const createAuthorSchema = z.object({
  name: z
    .string({ required_error: "Author name is required" })
    .trim()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name cannot exceed 100 characters"),

  bio: z
    .string()
    .trim()
    .max(2000, "Bio cannot exceed 2000 characters")
    .optional(),

  nationality: z
    .string()
    .trim()
    .max(100, "Nationality cannot exceed 100 characters")
    .optional(),

  birthDate: z.coerce.date().optional(),
});

/**
 * Validation schema for updating an author.
 */
export const updateAuthorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name cannot exceed 100 characters")
    .optional(),

  bio: z
    .string()
    .trim()
    .max(2000, "Bio cannot exceed 2000 characters")
    .optional(),

  nationality: z
    .string()
    .trim()
    .max(100, "Nationality cannot exceed 100 characters")
    .optional(),

  birthDate: z.coerce.date().optional(),
});

/**
 * Validation schema for author ID route parameters.
 */
export const authorIdParamSchema = z.object({
  id: z.string({ required_error: "Author id is required" }),
});
