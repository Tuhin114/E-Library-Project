import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateQuery } from "../middleware/validateQuery.js";
import {
  catalogAnalyticsQuerySchema,
  engagementAnalyticsQuerySchema,
  moderationAnalyticsQuerySchema,
  circulationAnalyticsQuerySchema,
  financialAnalyticsQuerySchema,
  automationAnalyticsQuerySchema,
  resourceAnalyticsQuerySchema,
  catalogExportQuerySchema,
  engagementExportQuerySchema,
  moderationExportQuerySchema,
  circulationExportQuerySchema,
  financialExportQuerySchema,
  automationExportQuerySchema,
  resourceExportQuerySchema,
} from "../validators/analyticsValidator.js";
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

router.get(
  "/circulation",
  validateQuery(circulationAnalyticsQuerySchema),
  analyticsController.getCirculationAnalytics,
);

router.get(
  "/financial",
  validateQuery(financialAnalyticsQuerySchema),
  analyticsController.getFinancialAnalytics,
);

router.get(
  "/automation",
  validateQuery(automationAnalyticsQuerySchema),
  analyticsController.getAutomationAnalytics,
);

router.get(
  "/resources",
  validateQuery(resourceAnalyticsQuerySchema),
  analyticsController.getResourceAnalytics,
);

// Export routes are separate from their JSON counterparts (rather than
// a shared route with an ?format=csv flag) so validateQuery's schema —
// which requires `dataset` — only applies where a dataset actually
// needs picking. The JSON routes stay untouched.
router.get(
  "/catalog/export",
  validateQuery(catalogExportQuerySchema),
  analyticsController.exportCatalogAnalytics,
);

router.get(
  "/engagement/export",
  validateQuery(engagementExportQuerySchema),
  analyticsController.exportEngagementAnalytics,
);

router.get(
  "/moderation/export",
  validateQuery(moderationExportQuerySchema),
  analyticsController.exportModerationAnalytics,
);

router.get(
  "/circulation/export",
  validateQuery(circulationExportQuerySchema),
  analyticsController.exportCirculationAnalytics,
);

router.get(
  "/financial/export",
  validateQuery(financialExportQuerySchema),
  analyticsController.exportFinancialAnalytics,
);

router.get(
  "/automation/export",
  validateQuery(automationExportQuerySchema),
  analyticsController.exportAutomationAnalytics,
);

router.get(
  "/resources/export",
  validateQuery(resourceExportQuerySchema),
  analyticsController.exportResourceAnalytics,
);

export default router;
