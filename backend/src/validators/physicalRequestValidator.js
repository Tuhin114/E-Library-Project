import { z } from "zod";
import { REQUEST_STATUS_VALUES } from "../constants/requestStatus.js";
import { MAX_LOAN_DURATION_DAYS } from "../constants/requestPolicy.js";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const requestIdParamSchema = z.object({
  id: objectIdSchema,
});

export const createRequestSchema = z
  .object({
    book: objectIdSchema,
    requestedCollectionDate: z.coerce.date({
      errorMap: () => ({ message: "A valid collection date is required" }),
    }),
    requestedReturnDate: z.coerce.date({
      errorMap: () => ({ message: "A valid return date is required" }),
    }),
    studentNote: z.string().trim().max(300, "Note cannot exceed 300 characters").optional(),
  })
  .refine((data) => data.requestedCollectionDate >= startOfToday(), {
    message: "Collection date cannot be in the past",
    path: ["requestedCollectionDate"],
  })
  .refine((data) => data.requestedReturnDate > data.requestedCollectionDate, {
    message: "Return date must be after the collection date",
    path: ["requestedReturnDate"],
  })
  .refine(
    (data) => {
      const days =
        (data.requestedReturnDate - data.requestedCollectionDate) /
        (1000 * 60 * 60 * 24);
      return days <= MAX_LOAN_DURATION_DAYS;
    },
    {
      message: `Requested period cannot exceed ${MAX_LOAN_DURATION_DAYS} days`,
      path: ["requestedReturnDate"],
    },
  );

export const rejectRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "A reason of at least 5 characters is required")
    .max(300, "Reason cannot exceed 300 characters"),
});

export const approveRequestSchema = z.object({
  note: z.string().trim().max(300, "Note cannot exceed 300 characters").optional(),
});

export const requestQuerySchema = z.object({
  status: z.enum(REQUEST_STATUS_VALUES).optional(),
  book: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const myRequestQuerySchema = z.object({
  status: z.enum(REQUEST_STATUS_VALUES).optional(),
});
