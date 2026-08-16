import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createReplySchema,
  discussionIdParamSchema,
} from "../validators/discussionValidator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/:id/replies",
  validateParams(discussionIdParamSchema),
  validateRequest(createReplySchema),
  discussionController.createReply,
);

// Cascade-deletes every reply under this discussion — see
// discussionService.deleteDiscussion.
router.delete(
  "/:id",
  validateParams(discussionIdParamSchema),
  discussionController.deleteDiscussion,
);

export default router;
