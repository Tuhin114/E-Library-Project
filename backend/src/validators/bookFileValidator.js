import { z } from "zod";
import { DIGITAL_FILE_TYPES } from "../constants/fileUploadLimits.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const remoteUrlSchema = z
  .string()
  .trim()
  .max(2048, "URL is too long")
  .url("A valid URL is required")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Only HTTP and HTTPS URLs are allowed")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return !parsed.username && !parsed.password;
    } catch {
      return false;
    }
  }, "URLs containing credentials are not allowed");

export const bookCoverParamSchema = z.object({
  id: objectIdSchema,
});

export const bookDigitalFileParamSchema = z.object({
  id: objectIdSchema,

  type: z.enum(DIGITAL_FILE_TYPES, {
    errorMap: () => ({
      message: `Type must be one of: ${DIGITAL_FILE_TYPES.join(", ")}`,
    }),
  }),
});

export const bookFileStreamQuerySchema = z.object({
  download: z.enum(["true", "false"]).optional(),
});

export const remoteFileUrlSchema = z.object({
  url: remoteUrlSchema,
});
