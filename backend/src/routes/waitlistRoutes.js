import { Router } from "express";
import * as waitlistController from "../controllers/waitlistController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { waitlistIdParamSchema, claimWaitlistSchema } from "../validators/waitlistValidator.js";

const router = Router();

router.use(authenticate);

// Ownership is checked in the service layer, same pattern
// physicalRequestRoutes uses for cancel — any authenticated role can
// call these for their own entry, no role restriction needed here.
router.delete(
  "/:id",
  validateParams(waitlistIdParamSchema),
  waitlistController.cancelWaitlistEntry,
);

router.patch(
  "/:id/claim",
  validateParams(waitlistIdParamSchema),
  validateRequest(claimWaitlistSchema),
  waitlistController.claimWaitlistEntry,
);

export default router;
