import { z } from "zod";

/**
 * Validation schema for creating a publisher.
 */
export const createPublisherSchema = z.object({
  name: z
    .string({ required_error: "Publisher name is required" })
    .trim()
    .min(2, "Publisher name must be at least 2 characters")
    .max(150, "Publisher name cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  country: z
    .string()
    .trim()
    .max(100, "Country cannot exceed 100 characters")
    .optional(),
});

/**
 * Validation schema for updating a publisher.
 */
export const updatePublisherSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Publisher name must be at least 2 characters")
    .max(150, "Publisher name cannot exceed 150 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  country: z
    .string()
    .trim()
    .max(100, "Country cannot exceed 100 characters")
    .optional(),
});

/**
 * Validation schema for publisher ID route parameters.
 */
export const publisherIdParamSchema = z.object({
  id: z.string({ required_error: "Publisher id is required" }),
});
