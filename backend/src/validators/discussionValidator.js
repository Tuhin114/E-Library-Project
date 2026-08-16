import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const createDiscussionSchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export const createReplySchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message cannot exceed 1000 characters"),
});

export const discussionIdParamSchema = z.object({
  id: objectIdSchema,
});

export const discussionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
