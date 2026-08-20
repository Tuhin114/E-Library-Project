import { Router } from "express";
import * as forumController from "../controllers/forumController.js";
import * as forumReportController from "../controllers/forumReportController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";
import {
  createThreadSchema,
  createReplySchema,
  threadIdParamSchema,
  threadQuerySchema,
} from "../validators/forumValidator.js";
import { createReportSchema } from "../validators/forumReportValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

// Shared across thread and reply creation — "posting anything" is
// what needs capping, not each endpoint separately. 20/hour/IP is
// generous for genuine use, tight enough to blunt a spam script.
const forumPostLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many forum posts. Please slow down and try again later.",
});

router.get("/", validateQuery(threadQuerySchema), forumController.listThreads);
router.get("/:id", validateParams(threadIdParamSchema), forumController.getThread);
router.post(
  "/",
  forumPostLimiter,
  validateRequest(createThreadSchema),
  forumController.createThread,
);
router.delete("/:id", validateParams(threadIdParamSchema), forumController.deleteThread);

router.post(
  "/:id/replies",
  forumPostLimiter,
  validateParams(threadIdParamSchema),
  validateRequest(createReplySchema),
  forumController.createReply,
);

router.post(
  "/:id/report",
  validateParams(threadIdParamSchema),
  validateRequest(createReportSchema),
  forumReportController.reportThread,
);

// Librarian-only moderation
router.patch(
  "/:id/lock",
  authorize(ROLES.LIBRARIAN),
  validateParams(threadIdParamSchema),
  forumController.toggleThreadLock,
);
router.patch(
  "/:id/pin",
  authorize(ROLES.LIBRARIAN),
  validateParams(threadIdParamSchema),
  forumController.toggleThreadPin,
);

export default router;
