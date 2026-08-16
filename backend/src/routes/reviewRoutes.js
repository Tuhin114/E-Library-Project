import { Router } from "express";
import * as reviewController from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  updateReviewSchema,
  reviewIdParamSchema,
} from "../validators/reviewValidator.js";

const router = Router();

router.use(authenticate);

router.patch(
  "/:id",
  validateParams(reviewIdParamSchema),
  validateRequest(updateReviewSchema),
  reviewController.updateReview,
);
router.delete(
  "/:id",
  validateParams(reviewIdParamSchema),
  reviewController.deleteReview,
);

export default router;
