import { z } from "zod";
import { LOAN_STATUS_VALUES } from "../constants/loanStatus.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const loanIdParamSchema = z.object({
  id: objectIdSchema,
});

export const loanQuerySchema = z.object({
  status: z.enum(LOAN_STATUS_VALUES).optional(),
});
