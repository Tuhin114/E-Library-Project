import { z } from "zod";

/**
 * Validation schema for creating a category.
 */
export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .trim()
    .toLowerCase()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

/**
 * Validation schema for updating a category.
 */
export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

/**
 * Validation schema for category ID route parameters.
 */
export const categoryIdParamSchema = z.object({
  id: z.string({ required_error: "Category id is required" }),
});
