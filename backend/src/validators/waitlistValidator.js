import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const bookIdParamSchema = z.object({
  id: objectIdSchema,
});

export const waitlistIdParamSchema = z.object({
  id: objectIdSchema,
});

// requestedReturnDate is optional — claimWaitlistEntry defaults to 14
// days out if omitted. When provided it must be in the future; the
// service itself doesn't re-derive a "max loan duration" cap for a
// claim the way createRequestSchema does for a normal request, since
// the copy here is already reserved specifically for this student
// regardless of how long they keep it.
export const claimWaitlistSchema = z.object({
  requestedReturnDate: z.coerce
    .date({ errorMap: () => ({ message: "A valid return date is required" }) })
    .refine((date) => date > new Date(), { message: "Return date must be in the future" })
    .optional(),
});
