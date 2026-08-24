import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { catalogAnalyticsQuerySchema, engagementAnalyticsQuerySchema, moderationAnalyticsQuerySchema } from "../validators/analyticsValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// Same authenticate+authorize(LIBRARIAN) gate forumReportRoutes uses —
// every route on this router is librarian-only, applied once here
// rather than per-route.
router.use(authenticate, authorize(ROLES.LIBRARIAN));

router.get(
  "/catalog",
  validateQuery(catalogAnalyticsQuerySchema),
  analyticsController.getCatalogAnalytics,
);

router.get(
  "/engagement",
  validateQuery(engagementAnalyticsQuerySchema),
  analyticsController.getEngagementAnalytics,
);

router.get(
  "/moderation",
  validateQuery(moderationAnalyticsQuerySchema),
  analyticsController.getModerationAnalytics,
);

export default router;
