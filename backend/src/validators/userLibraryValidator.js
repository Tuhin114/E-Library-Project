import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const favoriteBookParamSchema = z.object({
  bookId: objectIdSchema,
});
