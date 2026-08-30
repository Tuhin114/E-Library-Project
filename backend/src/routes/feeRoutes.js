import { Router } from "express";
import * as feeController from "../controllers/feeController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { feeIdParamSchema, feeQuerySchema, finalizeFeeSchema, waiveFeeSchema } from "../validators/feeValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateQuery(feeQuerySchema),
  feeController.listFees,
);

router.get("/:id", validateParams(feeIdParamSchema), feeController.getFee);

// Owner-vs-librarian access (and which payment method gets recorded) is
// resolved inside feeService.payFee, not here — same ownership-based
// pattern already used for GET /requests/:id and GET /loans/:id.
router.patch("/:id/pay", validateParams(feeIdParamSchema), feeController.payFee);

// M3 (Phase 7) — both librarian-only: confirming/adjusting a
// PENDING_REVIEW fee's amount, and waiving a fee outright.
router.patch(
  "/:id/finalize",
  authorize(ROLES.LIBRARIAN),
  validateParams(feeIdParamSchema),
  validateRequest(finalizeFeeSchema),
  feeController.finalizeFee,
);

router.patch(
  "/:id/waive",
  authorize(ROLES.LIBRARIAN),
  validateParams(feeIdParamSchema),
  validateRequest(waiveFeeSchema),
  feeController.waiveFee,
);

export default router;
