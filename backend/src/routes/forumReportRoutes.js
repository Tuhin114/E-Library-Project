import { Router } from "express";
import * as forumReportController from "../controllers/forumReportController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { reportIdParamSchema } from "../validators/forumReportValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate, authorize(ROLES.LIBRARIAN));

router.get("/", forumReportController.listReports);
router.patch(
  "/:id/resolve",
  validateParams(reportIdParamSchema),
  forumReportController.resolveReport,
);

export default router;
