import { z } from "zod";
import { FEE_STATUS_VALUES } from "../constants/feeStatus.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const feeIdParamSchema = z.object({
  id: objectIdSchema,
});

export const feeQuerySchema = z.object({
  status: z.enum(FEE_STATUS_VALUES).optional(),
});

// M3 (Phase 7)
export const finalizeFeeSchema = z.object({
  amount: z.coerce.number().min(0).max(5000).optional(),
});

export const waiveFeeSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "A reason of at least 5 characters is required")
    .max(300, "Reason cannot exceed 300 characters"),
});
