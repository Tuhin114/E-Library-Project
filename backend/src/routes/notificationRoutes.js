import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  notificationIdParamSchema,
  listNotificationsQuerySchema,
  updatePreferencesSchema,
} from "../validators/notificationValidator.js";

const router = Router();

router.use(authenticate);

router.get("/notifications", validateQuery(listNotificationsQuerySchema), notificationController.listNotifications);
router.get("/notifications/unread-count", notificationController.getUnreadCount);
router.patch(
  "/notifications/:id/read",
  validateParams(notificationIdParamSchema),
  notificationController.markAsRead,
);
router.patch("/notifications/read-all", notificationController.markAllAsRead);
router.delete(
  "/notifications/:id",
  validateParams(notificationIdParamSchema),
  notificationController.deleteNotification,
);

router.get("/notification-preferences", notificationController.getPreferences);
router.patch(
  "/notification-preferences",
  validateRequest(updatePreferencesSchema),
  notificationController.updatePreferences,
);

export default router;
