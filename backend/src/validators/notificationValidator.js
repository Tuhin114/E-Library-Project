import { z } from "zod";
import { NOTIFICATION_CATEGORY_VALUES } from "../constants/notificationTypes.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const notificationIdParamSchema = z.object({
  id: objectIdSchema,
});

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

const channelPrefsSchema = z
  .object({
    inApp: z.boolean().optional(),
    email: z.boolean().optional(),
  })
  .refine((val) => Object.keys(val).length > 0, {
    message: "At least one channel must be provided",
  });

// Every top-level key optional (a partial update — see
// notificationService.updatePreferences), but any key that IS present
// must be a real category with a real channel shape.
export const updatePreferencesSchema = z
  .object(
    Object.fromEntries(
      NOTIFICATION_CATEGORY_VALUES.map((category) => [category, channelPrefsSchema.optional()]),
    ),
  )
  .strict()
  .refine((val) => Object.keys(val).length > 0, {
    message: "At least one category must be provided",
  });
