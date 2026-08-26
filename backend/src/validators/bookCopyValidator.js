import { z } from "zod";
import {
  COPY_STATUS_VALUES,
  COPY_CONDITION_VALUES,
} from "../constants/copyStatus.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const copyIdParamSchema = z.object({
  id: objectIdSchema,
});

export const addCopiesSchema = z.object({
  count: z.coerce
    .number()
    .int()
    .min(1, "Must add at least 1 copy")
    .max(50, "Cannot add more than 50 copies at once"),
  condition: z.enum(COPY_CONDITION_VALUES).optional(),
});

export const copyQuerySchema = z.object({
  status: z.enum(COPY_STATUS_VALUES).optional(),
});

export const updateCopySchema = z
  .object({
    status: z.enum(COPY_STATUS_VALUES).optional(),
    condition: z.enum(COPY_CONDITION_VALUES).optional(),
    notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
