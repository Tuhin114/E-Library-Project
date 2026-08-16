// FILE PATH: backend/src/validators/bookValidator.js
// STATUS: MODIFIED

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const currentYear = new Date().getFullYear();

const bookBodyBase = {
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(300, "Title cannot exceed 300 characters"),

  subtitle: z
    .string()
    .trim()
    .max(300, "Subtitle cannot exceed 300 characters")
    .optional(),

  isbn: z
    .string({ required_error: "ISBN is required" })
    .trim()
    .min(10, "Enter a valid ISBN")
    .max(20, "Enter a valid ISBN"),

  description: z
    .string()
    .trim()
    .max(3000, "Description cannot exceed 3000 characters")
    .optional(),

  language: z.string().trim().min(1, "Language is required").default("English"),

  edition: z.string().trim().max(50).optional(),

  publicationYear: z.coerce
    .number()
    .int()
    .min(1000, "Enter a valid publication year")
    .max(currentYear, "Publication year cannot be in the future")
    .optional(),

  numberOfPages: z.coerce
    .number()
    .int()
    .min(1, "Number of pages must be at least 1")
    .optional(),

  category: objectIdSchema,

  authors: z.array(objectIdSchema).min(1, "At least one author is required"),

  publisher: objectIdSchema,

  tags: z.array(z.string().trim().min(1)).optional().default([]),

  visibility: z.enum(["public", "restricted"]).optional(),

  status: z.enum(["draft", "published", "archived"]).optional(),
};

/**
 * Validates POST /books request body.
 */
export const createBookSchema = z.object(bookBodyBase);

/**
 * Validates PATCH /books/:id request body.
 */
export const updateBookSchema = z.object(
  Object.fromEntries(
    Object.entries(bookBodyBase).map(([key, schema]) => [
      key,
      schema.optional(),
    ]),
  ),
);

/**
 * Validates book ID route parameter.
 */
export const bookIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Validates GET /books query parameters.
 *
 * All fields are optional.
 * Empty query returns the default book list.
 */
export const bookQuerySchema = z.object({
  search: z.string().trim().max(200, "Search term is too long").optional(),

  category: objectIdSchema.optional(),

  author: objectIdSchema.optional(),

  publisher: objectIdSchema.optional(),

  language: z.string().trim().max(100).optional(),

  tags: z.string().trim().max(200).optional(),

  status: z.enum(["draft", "published", "archived"]).optional(),

  visibility: z.enum(["public", "restricted"]).optional(),

  sort: z
    .enum([
      "newest",
      "oldest",
      "title_asc",
      "title_desc",
      "year_desc",
      "year_asc",
      "rating_desc",
    ])
    .optional(),

  page: z.coerce.number().int().min(1).optional(),

  limit: z.coerce.number().int().min(1).max(100).optional(),
});
