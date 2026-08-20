import { z } from "zod";
import { FORUM_CATEGORY_VALUES } from "../constants/forumCategories.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const createThreadSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  body: z
    .string({ required_error: "Body is required" })
    .trim()
    .min(1, "Body is required")
    .max(5000, "Body cannot exceed 5000 characters"),
  category: z.enum(FORUM_CATEGORY_VALUES, {
    errorMap: () => ({ message: "Invalid category" }),
  }),
});

export const createReplySchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export const threadIdParamSchema = z.object({
  id: objectIdSchema,
});

export const threadQuerySchema = z.object({
  category: z.enum(FORUM_CATEGORY_VALUES).optional(),
  sort: z.enum(["latest", "most_replies", "unanswered"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
