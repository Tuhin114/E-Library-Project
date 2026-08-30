import { z } from "zod";
import { APPROVAL_MODE_VALUES } from "../constants/approvalMode.js";

export const updateSettingsSchema = z
  .object({
    approvalMode: z.enum(APPROVAL_MODE_VALUES).optional(),
    autoApprovalBufferDays: z.coerce.number().int().min(0).max(14).optional(),
    // M2 (Phase 7)
    maxRenewals: z.coerce.number().int().min(0).max(5).optional(),
    renewalExtensionDays: z.coerce.number().int().min(1).max(30).optional(),
    waitlistClaimWindowHours: z.coerce.number().int().min(1).max(168).optional(),
    // M3 (Phase 7)
    defaultReplacementCost: z.coerce.number().min(0).max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
