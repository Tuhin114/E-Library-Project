import { z } from "zod";
import { APPROVAL_MODE_VALUES } from "../constants/approvalMode.js";

export const updateSettingsSchema = z
  .object({
    approvalMode: z.enum(APPROVAL_MODE_VALUES).optional(),
    autoApprovalBufferDays: z.coerce.number().int().min(0).max(14).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
