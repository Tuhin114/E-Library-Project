import { z } from "zod";
import { DIGITAL_FILE_TYPES } from "../constants/fileUploadLimits.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

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
