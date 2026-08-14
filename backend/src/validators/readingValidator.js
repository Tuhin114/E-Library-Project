import { z } from "zod";
import { DIGITAL_FILE_TYPES } from "../constants/fileUploadLimits.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const readingBookParamSchema = z.object({
  bookId: objectIdSchema,
});

export const bookmarkIdParamSchema = z.object({
  bookmarkId: objectIdSchema,
});

const formatSchema = z.enum(DIGITAL_FILE_TYPES, {
  errorMap: () => ({
    message: `Format must be one of: ${DIGITAL_FILE_TYPES.join(", ")}`,
  }),
});

export const progressBodySchema = z.object({
  format: formatSchema,
  location: z.string().trim().min(1, "Location is required"),
  percentComplete: z.number().min(0).max(100).optional(),
});

export const bookmarkBodySchema = z.object({
  format: formatSchema,
  location: z.string().trim().min(1, "Location is required"),
  label: z.string().trim().max(100).optional(),
});
