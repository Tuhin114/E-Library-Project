import { z } from "zod";
import { LOAN_STATUS_VALUES } from "../constants/loanStatus.js";
import { COPY_CONDITION_VALUES } from "../constants/copyStatus.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const loanIdParamSchema = z.object({
  id: objectIdSchema,
});

// M4 — added coercible boolean for the librarian overdue dashboard;
// "true"/"false" arrive as strings over the query string.
export const loanQuerySchema = z.object({
  status: z.enum(LOAN_STATUS_VALUES).optional(),
  overdueOnly: z.coerce.boolean().optional(),
});

export const returnLoanSchema = z.object({
  condition: z.enum(COPY_CONDITION_VALUES, {
    errorMap: () => ({ message: "A valid condition (new, good, fair, poor) is required" }),
  }),
  notes: z.string().trim().max(300, "Notes cannot exceed 300 characters").optional(),
});

// M3 (Phase 7)
export const reportLostSchema = z.object({
  notes: z.string().trim().max(300, "Notes cannot exceed 300 characters").optional(),
});
