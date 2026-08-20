import { z } from "zod";
import { FORUM_CATEGORIES } from "@/constants/forumCategories";

const CATEGORY_VALUES = Object.values(FORUM_CATEGORIES);

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
  category: z.enum(CATEGORY_VALUES, { errorMap: () => ({ message: "Please select a category" }) }),
});

export const replyMessageSchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export const reportSchema = z.object({
  reason: z.enum(["spam", "harassment", "inappropriate", "other"], {
    errorMap: () => ({ message: "Please select a reason" }),
  }),
  details: z.string().trim().max(500, "Details cannot exceed 500 characters").optional(),
});
