import { z } from "zod";

export const discussionMessageSchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export const replyMessageSchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message cannot exceed 1000 characters"),
});
