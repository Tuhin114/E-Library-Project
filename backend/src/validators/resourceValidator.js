import { z } from "zod";
import { RESOURCE_TYPE_VALUES } from "../constants/resourceType.js";
import { RESOURCE_VISIBILITY_VALUES } from "../constants/resourceVisibility.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const resourceBodyBase = {
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(300, "Title cannot exceed 300 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  resourceType: z.enum(RESOURCE_TYPE_VALUES, {
    errorMap: () => ({ message: "Invalid resource type" }),
  }),

  subject: z
    .string()
    .trim()
    .max(100, "Subject cannot exceed 100 characters")
    .optional(),

  authors: z.array(z.string().trim().min(1)).optional().default([]),

  tags: z.array(z.string().trim().min(1)).optional().default([]),

  visibility: z.enum(RESOURCE_VISIBILITY_VALUES).optional(),
};

/**
 * Validates POST /resources request body.
 */
export const createResourceSchema = z.object(resourceBodyBase);

/**
 * Validates PATCH /resources/:id request body.
 */
export const updateResourceSchema = z.object(
  Object.fromEntries(
    Object.entries(resourceBodyBase).map(([key, schema]) => [
      key,
      schema.optional(),
    ]),
  ),
);

export const resourceIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Validates GET /resources query parameters. All fields optional.
 */
export const resourceQuerySchema = z.object({
  search: z.string().trim().max(200, "Search term is too long").optional(),

  resourceType: z.enum(RESOURCE_TYPE_VALUES).optional(),

  subject: z.string().trim().max(100).optional(),

  tags: z.string().trim().max(200).optional(),

  // Scopes the list to the requester's own uploads (any visibility)
  // instead of the public-plus-own default — see resourceService.
  mine: z.coerce.boolean().optional(),

  sort: z.enum(["newest", "oldest", "title_asc", "title_desc"]).optional(),

  page: z.coerce.number().int().min(1).optional(),

  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/**
 * Validates GET /resources/:id/file/stream query parameters.
 */
export const resourceFileStreamQuerySchema = z.object({
  download: z.enum(["true", "false"]).optional(),
});
