import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const savedListBodyBase = {
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(150, "Title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
};

export const createSavedListSchema = z.object(savedListBodyBase);

export const updateSavedListSchema = z.object({
  title: savedListBodyBase.title.optional(),
  description: savedListBodyBase.description,
});

export const savedListIdParamSchema = z.object({
  listId: objectIdSchema,
});

export const savedListItemParamSchema = z.object({
  listId: objectIdSchema,
  resourceId: objectIdSchema,
});
