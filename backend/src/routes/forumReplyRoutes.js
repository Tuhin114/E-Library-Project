import { Router } from "express";
import * as forumController from "../controllers/forumController.js";
import * as forumReportController from "../controllers/forumReportController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { threadIdParamSchema } from "../validators/forumValidator.js";
import { createReportSchema } from "../validators/forumReportValidator.js";

const router = Router();

router.use(authenticate);

router.delete("/:id", validateParams(threadIdParamSchema), forumController.deleteReply);

router.post(
  "/:id/report",
  validateParams(threadIdParamSchema),
  validateRequest(createReportSchema),
  forumReportController.reportReply,
);

export default router;
