import { z } from "zod";
import { REPORT_REASON_VALUES } from "../constants/reportReasons.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const createReportSchema = z.object({
  reason: z.enum(REPORT_REASON_VALUES, {
    errorMap: () => ({ message: "Invalid report reason" }),
  }),
  details: z.string().trim().max(500, "Details cannot exceed 500 characters").optional(),
});

export const reportIdParamSchema = z.object({
  id: objectIdSchema,
});
