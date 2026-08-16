import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { discussionIdParamSchema } from "../validators/discussionValidator.js";

const router = Router();

router.use(authenticate);

router.delete(
  "/:id",
  validateParams(discussionIdParamSchema),
  discussionController.deleteReply,
);

export default router;
