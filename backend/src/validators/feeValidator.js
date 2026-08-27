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
